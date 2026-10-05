package ga.gabedt.auth;

import ga.gabedt.auth.dto.AuthRequest;
import ga.gabedt.auth.dto.AuthResponse;
import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.TooManyRequestsException;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.common.security.TokenHasher;
import ga.gabedt.mail.MailService;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RevokedTokenRepository revokedTokenRepository;
    private final LoginAttemptService loginAttemptService;
    private final MailService mailService;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final ga.gabedt.structure.repository.InstitutionRepository institutionRepository;

    private static final java.time.Duration ROTATION_GRACE = java.time.Duration.ofSeconds(30);

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    // Transaction en lecture : la connexion par matricule parcourt Student -> User (relation paresseuse)
    @Transactional(readOnly = true, noRollbackFor = BadCredentialsException.class)
    public AuthResponse login(AuthRequest request) {
        String identifier = request.getEmail();
        if (loginAttemptService.isBlocked(identifier)) {
            throw new TooManyRequestsException("Trop de tentatives de connexion. Réessayez dans quelques minutes.");
        }

        try {
            AuthResponse response = (identifier != null && !identifier.contains("@"))
                    ? loginWithMatricule(identifier, request.getPassword()) // Identifiant = matricule élève
                    : loginWithEmail(request);
            loginAttemptService.recordSuccess(identifier);
            return response;
        } catch (BadCredentialsException e) {
            loginAttemptService.recordFailure(identifier);
            throw e;
        }
    }

    /**
     * Rafraîchit le jeton d'accès à partir d'un refresh token valide (rotation : l'ancien est révoqué).
     */
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedAccessException("Refresh token manquant");
        }

        // Délai de grâce : plusieurs requêtes parallèles peuvent rafraîchir avec le même jeton.
        // Un jeton remplacé par rotation il y a moins de 30 s reste accepté ; un jeton
        // révoqué par une déconnexion ne l'est jamais.
        java.util.Optional<RevokedToken> revoked = revokedTokenRepository.findByTokenHash(TokenHasher.sha256(refreshToken));
        if (revoked.isPresent() && !(revoked.get().isRotated()
                && revoked.get().getRevokedAt().isAfter(LocalDateTime.now().minus(ROTATION_GRACE)))) {
            throw new UnauthorizedAccessException("Refresh token révoqué");
        }

        try {
            if (!jwtUtils.isRefreshToken(refreshToken)) {
                throw new UnauthorizedAccessException("Token fourni n'est pas un refresh token");
            }

            String email = jwtUtils.extractUsername(refreshToken);
            User user = userRepository.findByEmailAndDeletedFalse(email)
                    .orElseThrow(() -> new UnauthorizedAccessException("Utilisateur introuvable"));

            if (!user.isEnabled() || !jwtUtils.isTokenValid(refreshToken, user)) {
                throw new UnauthorizedAccessException("Refresh token invalide ou expiré");
            }

            if (revoked.isEmpty()) {
                revoke(refreshToken, true);
            }

            // Le rôle effectif (parent connecté via le matricule) est conservé d'un jeton à l'autre
            UserRole effectiveRole = user.getRole();
            if (user.getRole() == UserRole.STUDENT && UserRole.PARENT.name().equals(jwtUtils.extractRole(refreshToken))) {
                effectiveRole = UserRole.PARENT;
            }
            return buildResponse(user, effectiveRole, user.getEmail());

        } catch (UnauthorizedAccessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Refresh token validation failed: {}", e.getMessage());
            throw new UnauthorizedAccessException("Refresh token invalide");
        }
    }

    /**
     * Déconnexion : le refresh token est révoqué et ne peut plus être réutilisé.
     */
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                revoke(refreshToken, false);
            } catch (Exception e) {
                log.debug("Refresh token illisible à la déconnexion : {}", e.getMessage());
            }
        }
    }

    @Transactional
    public void forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmailAndDeletedFalse(email);
        if (userOpt.isEmpty()) {
            // Pas d'erreur si l'utilisateur n'existe pas : on empêche l'énumération des comptes
            return;
        }

        User user = userOpt.get();
        String token = TokenHasher.randomToken();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setTokenHash(TokenHasher.sha256(token));
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);

        String link = frontendUrl + "/reset-password?token=" + token;
        mailService.send(user.getEmail(), "GAB-EDT — Réinitialisation de votre mot de passe",
                "Bonjour " + user.getFirstName() + ",\n\n"
                        + "Pour choisir un nouveau mot de passe, ouvrez ce lien (valable 1 heure) :\n" + link + "\n\n"
                        + "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.");
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(TokenHasher.sha256(token))
                .orElseThrow(() -> new UnauthorizedAccessException("Token de réinitialisation invalide"));

        if (resetToken.isUsed()) {
            throw new UnauthorizedAccessException("Ce token de réinitialisation a déjà été utilisé");
        }

        if (resetToken.isExpired()) {
            throw new UnauthorizedAccessException("Ce token de réinitialisation a expiré");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Mot de passe réinitialisé pour l'utilisateur {}", user.getId());
    }

    /** Purge quotidienne des jetons révoqués expirés. */
    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void purgeExpiredRevokedTokens() {
        revokedTokenRepository.deleteExpired(LocalDateTime.now());
    }

    // ---- Private helpers ----

    private void revoke(String refreshToken, boolean rotated) {
        String hash = TokenHasher.sha256(refreshToken);
        RevokedToken existing = revokedTokenRepository.findByTokenHash(hash).orElse(null);
        if (existing != null) {
            if (!rotated && existing.isRotated()) {
                existing.setRotated(false); // une déconnexion annule le délai de grâce
                revokedTokenRepository.save(existing);
            }
            return;
        }
        RevokedToken revoked = new RevokedToken();
        revoked.setTokenHash(hash);
        revoked.setRevokedAt(LocalDateTime.now());
        revoked.setRotated(rotated);
        revoked.setExpiresAt(LocalDateTime.ofInstant(jwtUtils.extractExpiration(refreshToken).toInstant(), ZoneId.systemDefault()));
        revokedTokenRepository.save(revoked);
    }

    private AuthResponse loginWithMatricule(String matricule, String rawPassword) {
        // Un même matricule peut exister dans plusieurs établissements : seul le mot de passe les départage
        for (Student student : studentRepository.findAllByStudentNumberAndDeletedFalse(matricule)) {
            User user = student.getUser();

            boolean isStudent = passwordEncoder.matches(rawPassword, user.getPasswordHash());
            boolean isParent = student.getParentPasswordHash() != null
                    && passwordEncoder.matches(rawPassword, student.getParentPasswordHash());

            if ((isStudent || isParent) && user.isEnabled()) {
                // Rôle effectif déterminé sans modifier l'entité
                UserRole effectiveRole = isParent ? UserRole.PARENT : UserRole.STUDENT;
                AuthResponse response = buildResponse(user, effectiveRole, matricule);
                if (isParent) {
                    response.setLastName(user.getLastName() + " (Parent)");
                }
                return response;
            }
        }
        throw new BadCredentialsException("Matricule ou mot de passe incorrect");
    }

    private AuthResponse loginWithEmail(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        }

        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email ou mot de passe incorrect"));

        return buildResponse(user, user.getRole(), user.getEmail());
    }

    private AuthResponse buildResponse(User user, UserRole effectiveRole, String displayIdentifier) {
        if (user.getRole() != UserRole.SUPER_ADMIN && user.getInstitutionId() == null) {
            log.error("Compte {} sans établissement de rattachement : connexion refusée", user.getId());
            throw new UnauthorizedAccessException("Compte non rattaché à un établissement. Contactez votre administrateur.");
        }
        if (user.getInstitutionId() != null && institutionRepository.findById(user.getInstitutionId())
                .map(i -> !i.isActive()).orElse(true)) {
            throw new UnauthorizedAccessException("L'accès de votre établissement est suspendu. Contactez le support.");
        }
        return AuthResponse.builder()
                .token(jwtUtils.generateToken(user, effectiveRole))
                .refreshToken(jwtUtils.generateRefreshToken(user, effectiveRole))
                .type("Bearer")
                .email(displayIdentifier)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(effectiveRole.name())
                .institutionId(user.getInstitutionId())
                .build();
    }
}

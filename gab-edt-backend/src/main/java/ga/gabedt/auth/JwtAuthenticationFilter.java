package ga.gabedt.auth;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.tenant.TenantContext;
import ga.gabedt.user.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Authentifie la requête à partir du jeton d'accès (en-tête Bearer ou cookie HttpOnly)
 * et fixe l'établissement courant à partir de l'utilisateur authentifié.
 * <p>
 * L'en-tête {@value #TENANT_HEADER} n'est pris en compte que pour un SUPER_ADMIN,
 * qui peut ainsi agir sur un établissement précis.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String ACCESS_COOKIE = "jwt_token";
    private static final String TENANT_HEADER = "X-Tenant-ID";

    private final JwtUtils jwtUtils;
    private final ga.gabedt.user.UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            authenticate(request);
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private void authenticate(HttpServletRequest request) {
        // API stateless : le jeton de la requête est la seule source d'identité et d'établissement,
        // même si un contexte de sécurité traîne déjà sur le thread.
        String jwt = resolveToken(request);
        if (jwt == null) {
            return;
        }

        try {
            // Seuls les jetons d'accès authentifient l'API, jamais les refresh tokens
            if (!jwtUtils.isAccessToken(jwt)) {
                return;
            }

            String userEmail = jwtUtils.extractUsername(jwt);
            if (userEmail == null) {
                return;
            }

            User user = userRepository.findByEmailAndDeletedFalse(userEmail).orElse(null);
            if (user == null || !user.isEnabled() || !jwtUtils.isTokenValid(jwt, user)) {
                return;
            }
            // Fail-closed : un compte non SUPER_ADMIN sans établissement verrait toutes les données
            if (user.getRole() != UserRole.SUPER_ADMIN && user.getInstitutionId() == null) {
                log.warn("Compte {} sans établissement : accès refusé", user.getEmail());
                return;
            }

            // Le rôle effectif (ex. PARENT connecté via le matricule de l'élève) vient du jeton signé
            UserRole effectiveRole = resolveEffectiveRole(jwt, user);
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + effectiveRole.name()))
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            TenantContext.setTenantId(resolveTenant(request, user));
        } catch (Exception e) {
            // Jeton invalide ou expiré : la requête reste anonyme et Spring Security bloque l'accès
            log.debug("Jeton rejeté : {}", e.getMessage());
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if (ACCESS_COOKIE.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private UserRole resolveEffectiveRole(String jwt, User user) {
        String claimed = jwtUtils.extractRole(jwt);
        // Seule la bascule élève -> parent est légitime ; tout autre écart est ignoré
        if (user.getRole() == UserRole.STUDENT && UserRole.PARENT.name().equals(claimed)) {
            return UserRole.PARENT;
        }
        return user.getRole();
    }

    private UUID resolveTenant(HttpServletRequest request, User user) {
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            String header = request.getHeader(TENANT_HEADER);
            if (header != null && !header.isBlank()) {
                try {
                    return UUID.fromString(header);
                } catch (IllegalArgumentException e) {
                    log.warn("En-tête {} invalide : {}", TENANT_HEADER, header);
                }
            }
            return user.getInstitutionId();
        }
        return user.getInstitutionId();
    }
}

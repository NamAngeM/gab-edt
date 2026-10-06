package ga.gabedt.config;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crée le premier compte SUPER_ADMIN au démarrage si les variables
 * BOOTSTRAP_SUPER_ADMIN_EMAIL et BOOTSTRAP_SUPER_ADMIN_PASSWORD sont définies
 * et que le compte n'existe pas encore. Sans ces variables, rien n'est créé.
 * <p>
 * Une fois le compte créé, retirer le mot de passe des variables d'environnement.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SuperAdminBootstrap implements CommandLineRunner {

    private static final int MIN_PASSWORD_LENGTH = 12;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.super-admin.email:}")
    private String email;

    @Value("${app.bootstrap.super-admin.password:}")
    private String password;

    @Value("${app.bootstrap.super-admin.reset:false}")
    private boolean reset;

    @Override
    public void run(String... args) {
        if (email.isBlank() || password.isBlank()) {
            return;
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            log.error("BOOTSTRAP_SUPER_ADMIN_PASSWORD trop court ({} caractères minimum) : compte non créé", MIN_PASSWORD_LENGTH);
            return;
        }
        var existing = userRepository.findByEmailAndDeletedFalse(email);
        if (existing.isPresent()) {
            if (reset) {
                User admin = existing.get();
                admin.setPasswordHash(passwordEncoder.encode(password));
                userRepository.save(admin);
                log.warn("Mot de passe du SUPER_ADMIN {} réinitialisé. Retirez BOOTSTRAP_SUPER_ADMIN_RESET et BOOTSTRAP_SUPER_ADMIN_PASSWORD.", email);
            }
            return;
        }
        User admin = new User();
        admin.setEmail(email);
        admin.setFirstName("Super");
        admin.setLastName("Admin");
        admin.setRole(UserRole.SUPER_ADMIN);
        admin.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(admin);
        log.warn("Compte SUPER_ADMIN {} créé. Retirez BOOTSTRAP_SUPER_ADMIN_PASSWORD des variables d'environnement.", email);
    }
}

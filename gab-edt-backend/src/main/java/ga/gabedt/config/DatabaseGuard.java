package ga.gabedt.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/**
 * Empêche le démarrage hors profils dev/test avec une base H2 ou sans base configurée :
 * sans cette garde, une variable d'environnement oubliée lance l'application sur une base en mémoire.
 */
@Component
@RequiredArgsConstructor
public class DatabaseGuard implements InitializingBean {

    private final Environment environment;

    @Override
    public void afterPropertiesSet() {
        if (environment.acceptsProfiles(Profiles.of("dev", "test"))) {
            return;
        }
        String url = environment.getProperty("spring.datasource.url", "");
        if (url.isBlank() || url.startsWith("jdbc:h2:")) {
            throw new IllegalStateException(
                    "Démarrage refusé : aucune base PostgreSQL configurée. Définis SPRING_PROFILES_ACTIVE=prod et DB_URL.");
        }
    }
}

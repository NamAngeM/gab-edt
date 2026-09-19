package ga.gabedt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Point d'entrée principal de l'application GAB-EDT.
 * <p>
 * Plateforme de gestion des emplois du temps pour les établissements
 * scolaires et universitaires du Gabon.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
public class GabEdtApplication {

    public static void main(String[] args) {
        SpringApplication.run(GabEdtApplication.class, args);
    }

}

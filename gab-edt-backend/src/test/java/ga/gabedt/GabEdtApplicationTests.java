package ga.gabedt;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test — Vérifie que le contexte Spring Boot se charge correctement.
 */
@SpringBootTest
@ActiveProfiles("test")
class GabEdtApplicationTests {

    @Test
    void contextLoads() {
        // Le contexte Spring doit se charger sans erreur
    }

}

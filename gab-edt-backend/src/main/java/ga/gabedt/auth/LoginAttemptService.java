package ga.gabedt.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limite les tentatives de connexion échouées par identifiant (email ou matricule),
 * pour freiner les attaques par force brute. L'adresse IP n'est pas utilisée : derrière
 * le proxy du frontend, toutes les requêtes partagent la même IP.
 * <p>
 * Stockage en mémoire : suffisant pour une instance unique. En cas de déploiement
 * multi-instances, déplacer ces compteurs dans Redis.
 */
@Service
public class LoginAttemptService {

    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    @Value("${app.security.login.max-attempts:5}")
    private int maxAttempts = 5;

    @Value("${app.security.login.window-minutes:15}")
    private long windowMinutes = 15;

    public boolean isBlocked(String identifier) {
        return count(key(identifier)) >= maxAttempts;
    }

    public void recordFailure(String identifier) {
        add(key(identifier));
    }

    public void recordSuccess(String identifier) {
        failures.remove(key(identifier));
    }

    /** Évite que la table ne grossisse indéfiniment avec des identifiants aléatoires. */
    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 600_000)
    public void purge() {
        failures.forEach((key, deque) -> {
            synchronized (deque) {
                prune(deque);
                if (deque.isEmpty()) {
                    failures.remove(key, deque);
                }
            }
        });
    }

    private String key(String identifier) {
        return identifier == null ? "" : identifier.trim().toLowerCase(Locale.ROOT);
    }

    private void add(String key) {
        Deque<Instant> deque = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            prune(deque);
            deque.addLast(Instant.now());
        }
    }

    private int count(String key) {
        Deque<Instant> deque = failures.get(key);
        if (deque == null) return 0;
        synchronized (deque) {
            prune(deque);
            if (deque.isEmpty()) {
                failures.remove(key, deque);
            }
            return deque.size();
        }
    }

    private void prune(Deque<Instant> deque) {
        Instant limit = Instant.now().minus(Duration.ofMinutes(windowMinutes));
        while (!deque.isEmpty() && deque.peekFirst().isBefore(limit)) {
            deque.pollFirst();
        }
    }
}

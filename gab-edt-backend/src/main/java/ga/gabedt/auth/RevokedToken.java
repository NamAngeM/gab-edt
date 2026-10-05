package ga.gabedt.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Refresh token révoqué (déconnexion ou rotation). Persisté pour survivre aux redémarrages
 * et rester cohérent entre plusieurs instances du backend.
 */
@Entity
@Table(name = "revoked_tokens")
@Getter
@Setter
@NoArgsConstructor
public class RevokedToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at", nullable = false)
    private LocalDateTime revokedAt;

    /**
     * true si le jeton a été remplacé par rotation (rafraîchissement), false s'il a été
     * révoqué par une déconnexion. Seule une rotation récente bénéficie d'un délai de grâce.
     */
    @Column(nullable = false)
    private boolean rotated;
}

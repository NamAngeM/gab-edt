package ga.gabedt.auth;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtils {

    private static final int MIN_SECRET_BYTES = 32;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:900000}")
    private long jwtExpirationMs; // Default: 15 minutes

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs; // Default: 7 days

    private SecretKey signingKey;

    /**
     * Refuse de démarrer avec un secret absent ou trop court : un secret faible
     * permettrait de forger des jetons pour n'importe quel compte.
     */
    @PostConstruct
    void validateSecret() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            throw new IllegalStateException("JWT_SECRET doit être défini et faire au moins " + MIN_SECRET_BYTES + " octets");
        }
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey getSigningKey() {
        if (signingKey == null) {
            validateSecret();
        }
        return signingKey;
    }

    public long getAccessExpirationMs() {
        return jwtExpirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", String.class));
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Jeton d'accès : rôle effectif, identifiant utilisateur et établissement.
     * Le rôle et l'établissement sont informatifs pour les clients ; le backend
     * les relit toujours depuis la base (cf. JwtAuthenticationFilter).
     */
    public String generateToken(User user, UserRole effectiveRole) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", effectiveRole.name());
        claims.put("userId", user.getId().toString());
        if (user.getInstitutionId() != null) {
            claims.put("tenantId", user.getInstitutionId().toString());
        }
        claims.put("type", "ACCESS");
        return buildToken(claims, user.getEmail(), jwtExpirationMs);
    }

    /**
     * Generate an access token using the user's own role.
     */
    public String generateToken(UserDetails userDetails) {
        if (userDetails instanceof User user) {
            return generateToken(user, user.getRole());
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "ACCESS");
        return buildToken(claims, userDetails.getUsername(), jwtExpirationMs);
    }

    /**
     * Refresh token. Le rôle effectif y est conservé pour qu'un parent (connecté via
     * le matricule de l'élève) ne redevienne pas élève lors du rafraîchissement.
     */
    public String generateRefreshToken(User user, UserRole effectiveRole) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("role", effectiveRole.name());
        claims.put("type", "REFRESH");
        return buildToken(claims, user.getEmail(), refreshExpirationMs);
    }

    public String generateRefreshToken(User user) {
        return generateRefreshToken(user, user.getRole());
    }

    private String buildToken(Map<String, Object> claims, String subject, long expirationMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .id(UUID.randomUUID().toString())
                .subject(subject)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public boolean isAccessToken(String token) {
        return "ACCESS".equals(extractTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return "REFRESH".equals(extractTokenType(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}

package ga.gabedt.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, UUID> {
    boolean existsByTokenHash(String tokenHash);

    java.util.Optional<RevokedToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("delete from RevokedToken r where r.expiresAt < :now")
    int deleteExpired(LocalDateTime now);
}

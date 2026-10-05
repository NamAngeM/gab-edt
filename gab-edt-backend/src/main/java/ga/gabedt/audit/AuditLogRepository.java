package ga.gabedt.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID>, JpaSpecificationExecutor<AuditLog> {

    Page<AuditLog> findByDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<AuditLog> findByEntityTypeAndDeletedFalseOrderByCreatedAtDesc(String entityType, Pageable pageable);

    Page<AuditLog> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}

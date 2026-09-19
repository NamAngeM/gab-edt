package ga.gabedt.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID>, JpaSpecificationExecutor<Teacher> {
    List<Teacher> findAllByDeletedFalse();
    long countByDeletedFalse();
    List<Teacher> findByOrgUnits_IdAndDeletedFalse(UUID orgUnitId);
    Optional<Teacher> findByUserIdAndDeletedFalse(UUID userId);
}

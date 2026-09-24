package ga.gabedt.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID>, JpaSpecificationExecutor<Student> {
    List<Student> findAllByDeletedFalse();
    long countByDeletedFalse();
    List<Student> findByOrgUnits_IdAndDeletedFalse(UUID orgUnitId);
    Optional<Student> findByUserIdAndDeletedFalse(UUID userId);
    Optional<Student> findByStudentNumberAndDeletedFalse(String studentNumber);
}

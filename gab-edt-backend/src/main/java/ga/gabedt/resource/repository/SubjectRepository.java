package ga.gabedt.resource.repository;

import ga.gabedt.resource.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    List<Subject> findAllByDeletedFalse();
    long countByDeletedFalse();
    List<Subject> findByOrgUnitIdAndDeletedFalse(UUID orgUnitId);
    Optional<Subject> findByCodeAndDeletedFalse(String code);
}

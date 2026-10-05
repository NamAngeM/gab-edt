package ga.gabedt.student.disciplinary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DisciplinaryRecordRepository extends JpaRepository<DisciplinaryRecord, UUID> {
    List<DisciplinaryRecord> findByStudentIdAndDeletedFalseOrderByIncidentDateDesc(UUID studentId);
    List<DisciplinaryRecord> findByDeletedFalseOrderByIncidentDateDesc();
}

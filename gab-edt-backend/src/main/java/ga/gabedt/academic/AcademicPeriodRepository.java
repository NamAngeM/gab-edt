package ga.gabedt.academic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AcademicPeriodRepository extends JpaRepository<AcademicPeriod, UUID> {
    List<AcademicPeriod> findByAcademicYearIdAndDeletedFalseOrderByOrderIndexAsc(UUID academicYearId);
}

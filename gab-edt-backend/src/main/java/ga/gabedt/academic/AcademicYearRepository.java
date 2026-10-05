package ga.gabedt.academic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, UUID> {
    List<AcademicYear> findByInstitutionIdAndDeletedFalseOrderByStartDateDesc(UUID institutionId);
    List<AcademicYear> findByTenantIdAndDeletedFalseOrderByStartDateDesc(UUID tenantId);

    /** Années de l'établissement courant (filtre @TenantId). */
    List<AcademicYear> findByDeletedFalseOrderByStartDateDesc();
}

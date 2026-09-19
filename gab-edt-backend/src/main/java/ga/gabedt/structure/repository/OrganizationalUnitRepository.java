package ga.gabedt.structure.repository;

import ga.gabedt.structure.OrganizationalUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationalUnitRepository extends JpaRepository<OrganizationalUnit, UUID> {
    List<OrganizationalUnit> findByInstitutionIdAndParentIsNull(UUID institutionId);
    List<OrganizationalUnit> findByParentId(UUID parentId);
}

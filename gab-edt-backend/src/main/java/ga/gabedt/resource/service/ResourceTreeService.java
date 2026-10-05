package ga.gabedt.resource.service;

import ga.gabedt.resource.dto.ResourceTreeDto;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.resource.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceTreeService {

    private final ga.gabedt.tenant.CurrentTenant currentTenant;
    private final OrganizationalUnitRepository organizationalUnitRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;

    public ResourceTreeDto getResourceTree() {
        ResourceTreeDto tree = new ResourceTreeDto();
        
        // Pour simplifier le MVP, on prend la première institution
        Institution inst = currentTenant.requireInstitution();
        if (inst == null) return tree;

        ResourceTreeDto.InstitutionNode iNode = new ResourceTreeDto.InstitutionNode();
        iNode.setId(inst.getId());
        iNode.setName(inst.getName());
        iNode.setType(inst.getType().name());

        List<OrganizationalUnit> rootUnits = organizationalUnitRepository.findByInstitutionIdAndParentIsNull(inst.getId());
        iNode.setRootUnits(rootUnits.stream().map(this::mapToNode).collect(Collectors.toList()));
        
        tree.setInstitution(iNode);
        return tree;
    }

    private ResourceTreeDto.OrgUnitNode mapToNode(OrganizationalUnit unit) {
        ResourceTreeDto.OrgUnitNode node = new ResourceTreeDto.OrgUnitNode();
        node.setId(unit.getId());
        node.setName(unit.getName());
        node.setType(unit.getType().name());

        // Fetch children
        if (unit.getChildren() != null) {
            node.setChildren(unit.getChildren().stream().map(this::mapToNode).collect(Collectors.toList()));
        }

        // Fetch Teachers
        teacherRepository.findByOrgUnits_IdAndDeletedFalse(unit.getId()).forEach(t -> {
            ResourceTreeDto.ResourceItem item = new ResourceTreeDto.ResourceItem();
            item.setId(t.getId());
            item.setName(t.getUser().getFirstName() + " " + t.getUser().getLastName());
            item.setResourceType("TEACHER");
            node.getResources().add(item);
        });

        // Fetch Rooms
        roomRepository.findByOrgUnitIdAndDeletedFalse(unit.getId()).forEach(r -> {
            ResourceTreeDto.ResourceItem item = new ResourceTreeDto.ResourceItem();
            item.setId(r.getId());
            item.setName(r.getName());
            item.setResourceType("ROOM");
            node.getResources().add(item);
        });

        return node;
    }
}

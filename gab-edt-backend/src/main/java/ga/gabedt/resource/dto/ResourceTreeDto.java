package ga.gabedt.resource.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class ResourceTreeDto {
    private InstitutionNode institution;

    @Data
    public static class InstitutionNode {
        private UUID id;
        private String name;
        private String type;
        private List<OrgUnitNode> rootUnits = new ArrayList<>();
    }

    @Data
    public static class OrgUnitNode {
        private UUID id;
        private String name;
        private String type;
        private List<OrgUnitNode> children = new ArrayList<>();
        private List<ResourceItem> resources = new ArrayList<>(); // Teachers, Rooms linked here
    }

    @Data
    public static class ResourceItem {
        private UUID id;
        private String name;
        private String resourceType; // TEACHER, ROOM
    }
}

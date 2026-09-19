package ga.gabedt.structure.dto;

import ga.gabedt.structure.OrgUnitType;
import lombok.Data;
import java.util.UUID;

@Data
public class OrgUnitCreateDto {
    private String name;
    private OrgUnitType type;
    private UUID institutionId;
    private UUID parentId;
}

package ga.gabedt.resource.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SubjectDto {
    private UUID id;
    private String name;
    private String code;
    private OrgUnitSimpleDto orgUnit;

    @Data
    public static class OrgUnitSimpleDto {
        private UUID id;
        private String name;
    }
}

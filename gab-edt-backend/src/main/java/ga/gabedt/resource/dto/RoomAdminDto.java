package ga.gabedt.resource.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class RoomAdminDto {
    private UUID id;
    private String name;
    private String code;
    private Integer capacity;
    private String type;
    private boolean active;
    private UUID orgUnitId;
}

package ga.gabedt.resource.dto;

import lombok.Data;
import java.util.UUID;
import java.util.List;

@Data
public class RoomAdminDto {
    private UUID id;
    private String name;
    private String code;
    private Integer capacity;
    private String type;
    private List<String> equipments;
    private boolean active;
    private UUID orgUnitId;
}

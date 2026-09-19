package ga.gabedt.user.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class BulkStatusDto {
    private List<UUID> ids;
    private boolean active;
}

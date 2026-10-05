package ga.gabedt.audit.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AuditLogDto {
    private UUID id;
    private String action;
    private String entityType;
    private UUID entityId;
    private String oldValues;
    private String newValues;
    private String ipAddress;
    private String description;
    private String userEmail;
    private String userName;
    private LocalDateTime createdAt;
}

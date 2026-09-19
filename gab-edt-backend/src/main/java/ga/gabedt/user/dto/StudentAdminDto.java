package ga.gabedt.user.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class StudentAdminDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String studentNumber;
    private String phone;
    private boolean active;
    private java.util.List<UUID> orgUnitIds;
}

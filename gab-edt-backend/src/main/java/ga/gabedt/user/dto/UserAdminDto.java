package ga.gabedt.user.dto;

import ga.gabedt.common.enums.UserRole;
import lombok.Data;
import java.util.Set;
import java.util.UUID;

@Data
public class UserAdminDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private UserRole role;
    private boolean active;
    private Set<UUID> managedOrgUnitIds;
}

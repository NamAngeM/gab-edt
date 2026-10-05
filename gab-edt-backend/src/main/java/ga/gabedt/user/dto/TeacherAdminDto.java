package ga.gabedt.user.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class TeacherAdminDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String employeeNumber;
    private String phone;
    private boolean active;
    private java.util.List<UUID> orgUnitIds;
    /** Mot de passe provisoire, renvoyé une seule fois à la création (jamais stocké en clair). */
    private String initialPassword;
}

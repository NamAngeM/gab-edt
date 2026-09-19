package ga.gabedt.user.dto;

import ga.gabedt.common.enums.UserRole;
import lombok.Data;

@Data
public class UserUpdateDto {
    private String firstName;
    private String lastName;
    private String phone;
    private UserRole role;
    private Boolean active;
}

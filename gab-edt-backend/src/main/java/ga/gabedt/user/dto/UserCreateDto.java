package ga.gabedt.user.dto;

import ga.gabedt.common.enums.UserRole;
import lombok.Data;

@Data
public class UserCreateDto {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private UserRole role;
    private boolean active = true;
}

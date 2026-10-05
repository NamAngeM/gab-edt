package ga.gabedt.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {

    /** Email, ou matricule pour les élèves et parents (pas de contrainte de format). */
    @NotBlank(message = "L'identifiant est requis")
    @jakarta.validation.constraints.Size(max = 254)
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    private String password;
}

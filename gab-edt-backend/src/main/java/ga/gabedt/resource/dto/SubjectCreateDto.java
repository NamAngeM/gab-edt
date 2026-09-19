package ga.gabedt.resource.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class SubjectCreateDto {
    @NotBlank(message = "Le nom est obligatoire")
    private String name;
    
    private String code;
    
    private UUID orgUnitId;
}

package ga.gabedt.student.disciplinary.dto;

import ga.gabedt.student.disciplinary.DisciplinaryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DisciplinaryRecordCreateDto {
    @NotNull(message = "L'ID de l'élève est requis")
    private UUID studentId;
    
    @NotNull(message = "Le type d'incident est requis")
    private DisciplinaryType type;
    
    @NotBlank(message = "La description est requise")
    private String description;
    
    @NotNull(message = "La date de l'incident est requise")
    private LocalDateTime incidentDate;
}

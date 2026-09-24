package ga.gabedt.homework;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HomeworkDto {
    private UUID id;
    private String title;
    private String description;
    private boolean completed;
}

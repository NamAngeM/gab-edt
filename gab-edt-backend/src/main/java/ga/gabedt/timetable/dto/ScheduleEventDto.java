package ga.gabedt.timetable.dto;

import ga.gabedt.timetable.enums.EventStatus;
import ga.gabedt.timetable.enums.PublicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleEventDto {
    private UUID id;
    private SubjectDto subject;
    private TeacherDto teacher;
    private GroupDto group;
    private RoomDto room;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private EventStatus status;
    private PublicationStatus publicationStatus;
    
    // Conflict Info
    private boolean conflict;
    private String conflictDetails;
}

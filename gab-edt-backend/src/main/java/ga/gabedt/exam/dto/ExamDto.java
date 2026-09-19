package ga.gabedt.exam.dto;

import ga.gabedt.timetable.dto.TeacherDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ExamDto(
    UUID id,
    UUID sessionId,
    UUID subjectId,
    String subjectName,
    UUID roomId,
    String roomName,
    LocalDateTime startAt,
    LocalDateTime endAt,
    List<TeacherDto> supervisors
) {}

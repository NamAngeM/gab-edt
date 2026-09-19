package ga.gabedt.defense.dto;

import ga.gabedt.timetable.dto.TeacherDto;

import java.time.LocalDateTime;
import java.util.UUID;

public record DefenseDto(
    UUID id,
    UUID studentId,
    String studentName,
    String topic,
    UUID roomId,
    String roomName,
    LocalDateTime startAt,
    LocalDateTime endAt,
    TeacherDto president,
    TeacherDto examiner,
    TeacherDto reporter
) {}

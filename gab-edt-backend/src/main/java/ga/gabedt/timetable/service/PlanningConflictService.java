package ga.gabedt.timetable.service;

import ga.gabedt.academic.AcademicCalendarService;
import ga.gabedt.common.exception.ScheduleConflictException;
import ga.gabedt.defense.repository.DefenseRepository;
import ga.gabedt.exam.repository.ExamRepository;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.service.TeacherAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlanningConflictService {

    private final ScheduleEventRepository scheduleEventRepository;
    private final ExamRepository examRepository;
    private final DefenseRepository defenseRepository;
    private final RoomRepository roomRepository;
    private final StudentRepository studentRepository;
    private final TeacherAvailabilityService teacherAvailabilityService;
    private final AcademicCalendarService academicCalendarService;

    public enum Origin { COURSE, EXAM, DEFENSE }

    public void validateCourse(UUID teacherId, UUID roomId, UUID orgUnitId,
                               LocalDateTime start, LocalDateTime end,
                               UUID excludeId, boolean allowDuringClosure) {
        academicCalendarService.checkSchedulable(start, end, allowDuringClosure);
        checkTeacher(teacherId, start, end, excludeId, Origin.COURSE);
        checkRoom(roomId, start, end, excludeId, Origin.COURSE, orgUnitId);
        checkOrgUnit(orgUnitId, start, end, excludeId);
    }

    public void validateExam(UUID roomId, List<UUID> supervisorIds,
                             LocalDateTime start, LocalDateTime end,
                             UUID excludeId) {
        academicCalendarService.checkSchedulable(start, end, false);

        if (roomId != null) {
            checkRoomAcrossAll(roomId, start, end, excludeId, Origin.EXAM, null);
        }

        if (supervisorIds != null) {
            for (UUID tid : supervisorIds) {
                checkTeacherAcrossAll(tid, start, end, excludeId, Origin.EXAM);
            }
        }
    }

    public void validateDefense(UUID roomId, UUID presidentId, UUID examinerId, UUID reporterId,
                                LocalDateTime start, LocalDateTime end,
                                UUID excludeId) {
        academicCalendarService.checkSchedulable(start, end, false);

        if (roomId != null) {
            checkRoomAcrossAll(roomId, start, end, excludeId, Origin.DEFENSE, null);
        }

        List<UUID> juryIds = new ArrayList<>();
        if (presidentId != null) juryIds.add(presidentId);
        if (examinerId != null) juryIds.add(examinerId);
        if (reporterId != null) juryIds.add(reporterId);

        for (UUID tid : juryIds) {
            checkTeacherAcrossAll(tid, start, end, excludeId, Origin.DEFENSE);
        }
    }

    private void checkTeacher(UUID teacherId, LocalDateTime start, LocalDateTime end,
                              UUID excludeId, Origin origin) {
        if (teacherId == null) return;

        String unavailability = teacherAvailabilityService.unavailabilityReason(teacherId, start, end);
        if (unavailability != null) throw new ScheduleConflictException(unavailability);

        checkTeacherAcrossAll(teacherId, start, end, excludeId, origin);
    }

    private void checkTeacherAcrossAll(UUID teacherId, LocalDateTime start, LocalDateTime end,
                                       UUID excludeId, Origin origin) {
        boolean courseConflict = origin == Origin.COURSE
                ? (excludeId == null
                    ? scheduleEventRepository.existsOverlappingForTeacher(teacherId, start, end)
                    : scheduleEventRepository.existsOverlappingForTeacherWithExclude(teacherId, start, end, excludeId))
                : scheduleEventRepository.existsOverlappingForTeacher(teacherId, start, end);
        if (courseConflict) throw new ScheduleConflictException("L'enseignant a déjà un cours sur ce créneau.");

        boolean examConflict = origin == Origin.EXAM && excludeId != null
                ? examRepository.existsOverlappingForSupervisorExclude(teacherId, start, end, excludeId)
                : examRepository.existsOverlappingForSupervisor(teacherId, start, end);
        if (examConflict) throw new ScheduleConflictException("L'enseignant surveille déjà un examen sur ce créneau.");

        boolean defenseConflict = origin == Origin.DEFENSE && excludeId != null
                ? defenseRepository.existsOverlappingForJuryExclude(teacherId, start, end, excludeId)
                : defenseRepository.existsOverlappingForJury(teacherId, start, end);
        if (defenseConflict) throw new ScheduleConflictException("L'enseignant est membre d'un jury de soutenance sur ce créneau.");
    }

    private void checkRoom(UUID roomId, LocalDateTime start, LocalDateTime end,
                           UUID excludeId, Origin origin, UUID orgUnitId) {
        if (roomId == null) return;
        checkRoomAcrossAll(roomId, start, end, excludeId, origin, orgUnitId);
    }

    private void checkRoomAcrossAll(UUID roomId, LocalDateTime start, LocalDateTime end,
                                    UUID excludeId, Origin origin, UUID orgUnitId) {
        boolean courseConflict = origin == Origin.COURSE
                ? (excludeId == null
                    ? scheduleEventRepository.existsOverlappingForRoom(roomId, start, end)
                    : scheduleEventRepository.existsOverlappingForRoomWithExclude(roomId, start, end, excludeId))
                : scheduleEventRepository.existsOverlappingForRoom(roomId, start, end);
        if (courseConflict) throw new ScheduleConflictException("La salle est déjà réservée pour un cours sur ce créneau.");

        boolean examConflict = origin == Origin.EXAM && excludeId != null
                ? examRepository.existsOverlappingForRoomExclude(roomId, start, end, excludeId)
                : examRepository.existsOverlappingForRoom(roomId, start, end);
        if (examConflict) throw new ScheduleConflictException("La salle est déjà réservée pour un examen sur ce créneau.");

        boolean defenseConflict = origin == Origin.DEFENSE && excludeId != null
                ? defenseRepository.existsOverlappingForRoomExclude(roomId, start, end, excludeId)
                : defenseRepository.existsOverlappingForRoom(roomId, start, end);
        if (defenseConflict) throw new ScheduleConflictException("La salle est déjà réservée pour une soutenance sur ce créneau.");

        if (orgUnitId != null) {
            Room room = roomRepository.findById(roomId).orElse(null);
            if (room != null && room.getCapacity() != null) {
                long studentCount = studentRepository.countByOrgUnits_IdAndDeletedFalse(orgUnitId);
                if (studentCount > room.getCapacity()) {
                    throw new ScheduleConflictException(
                            "Capacité insuffisante : " + studentCount + " élèves pour " + room.getCapacity() + " places (" + room.getName() + ").");
                }
            }
        }
    }

    private void checkOrgUnit(UUID orgUnitId, LocalDateTime start, LocalDateTime end, UUID excludeId) {
        if (orgUnitId == null) return;
        boolean conflict = excludeId == null
                ? scheduleEventRepository.existsOverlappingForOrgUnit(orgUnitId, start, end)
                : scheduleEventRepository.existsOverlappingForOrgUnitWithExclude(orgUnitId, start, end, excludeId);
        if (conflict) throw new ScheduleConflictException("Le groupe a déjà cours sur cette plage horaire.");
    }

    // --- For the conflicts page: cross-entity descriptions ---

    public String teacherCrossConflicts(UUID teacherId, LocalDateTime start, LocalDateTime end, UUID excludeEventId) {
        if (teacherId == null) return "";
        StringBuilder sb = new StringBuilder();
        if (examRepository.existsOverlappingForSupervisor(teacherId, start, end))
            sb.append("L'enseignant surveille un examen. ");
        if (defenseRepository.existsOverlappingForJury(teacherId, start, end))
            sb.append("L'enseignant est en jury de soutenance. ");
        return sb.toString();
    }

    public String roomCrossConflicts(UUID roomId, LocalDateTime start, LocalDateTime end) {
        if (roomId == null) return "";
        StringBuilder sb = new StringBuilder();
        if (examRepository.existsOverlappingForRoom(roomId, start, end))
            sb.append("La salle est prise par un examen. ");
        if (defenseRepository.existsOverlappingForRoom(roomId, start, end))
            sb.append("La salle est prise par une soutenance. ");
        return sb.toString();
    }
}

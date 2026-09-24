package ga.gabedt.timetable.service;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import java.util.ArrayList;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.dto.*;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.common.exception.ScheduleConflictException;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.timetable.Course;
import ga.gabedt.timetable.repository.CourseRepository;
import ga.gabedt.homework.Homework;
import ga.gabedt.homework.HomeworkRepository;
import ga.gabedt.homework.HomeworkStatus;
import ga.gabedt.homework.HomeworkStatusRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleEventService {

    private final ScheduleEventRepository scheduleEventRepository;
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final OrganizationalUnitRepository orgUnitRepository;
    private final InstitutionRepository institutionRepository;
    private final ga.gabedt.notification.NotificationService notificationService;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkStatusRepository homeworkStatusRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public List<ScheduleEventDto> searchEvents(UUID groupId, UUID teacherId, UUID roomId, LocalDate startDate, LocalDate endDate) {
        
        LocalDateTime start = (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = (endDate != null) ? endDate.atTime(23, 59, 59) : LocalDateTime.now().plusMonths(1);
        
        Specification<ScheduleEvent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));
            predicates.add(cb.between(root.get("startAt"), start, end));
            
            if (groupId != null) {
                predicates.add(cb.equal(root.get("orgUnit").get("id"), groupId));
            }
            if (teacherId != null) {
                predicates.add(cb.equal(root.get("teacher").get("id"), teacherId));
            }
            if (roomId != null) {
                predicates.add(cb.equal(root.get("room").get("id"), roomId));
            }
            
            if (Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("course", JoinType.LEFT).fetch("subject", JoinType.LEFT);
                root.fetch("teacher", JoinType.LEFT).fetch("user", JoinType.LEFT);
                root.fetch("orgUnit", JoinType.LEFT);
                root.fetch("room", JoinType.LEFT);
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<ScheduleEvent> events = scheduleEventRepository.findAll(spec);
        
        List<ScheduleEventDto> dtos = events.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Populate homework for student if applicable
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            try {
                User user = userRepository.findByEmailAndDeletedFalse(auth.getName()).orElse(null);
                if (user != null && (user.getRole().name().equals("STUDENT") || user.getRole().name().equals("PARENT"))) {
                    Student student = studentRepository.findByUserIdAndDeletedFalse(user.getId()).orElse(null);
                    if (student != null) {
                        for (ScheduleEventDto dto : dtos) {
                            Homework hw = homeworkRepository.findByScheduleEventIdAndDeletedFalseOrderByIdDesc(dto.getId()).orElse(null);
                            if (hw != null) {
                                dto.setHomeworkId(hw.getId());
                                dto.setHomeworkTitle(hw.getTitle());
                                HomeworkStatus status = homeworkStatusRepository.findByHomeworkIdAndStudentIdAndDeletedFalse(hw.getId(), student.getId()).orElse(null);
                                dto.setHomeworkDone(status != null && status.isCompleted());
                            }
                        }
                    }
                } else if (user != null && user.getRole().name().equals("TEACHER")) {
                    for (ScheduleEventDto dto : dtos) {
                        Homework hw = homeworkRepository.findByScheduleEventIdAndDeletedFalseOrderByIdDesc(dto.getId()).orElse(null);
                        if (hw != null) {
                            dto.setHomeworkId(hw.getId());
                            dto.setHomeworkTitle(hw.getTitle());
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        
        return dtos;
    }

    private ScheduleEventDto mapToDto(ScheduleEvent event) {
        SubjectDto subjectDto = null;
        if (event.getCourse() != null && event.getCourse().getSubject() != null) {
            subjectDto = new SubjectDto(
                    event.getCourse().getSubject().getId(),
                    event.getCourse().getSubject().getName(),
                    event.getCourse().getSubject().getCode()
            );
        }

        TeacherDto teacherDto = null;
        if (event.getTeacher() != null && event.getTeacher().getUser() != null) {
            teacherDto = new TeacherDto(
                    event.getTeacher().getId(),
                    event.getTeacher().getUser().getFirstName(),
                    event.getTeacher().getUser().getLastName()
            );
        }

        GroupDto groupDto = null;
        if (event.getOrgUnit() != null) {
            groupDto = new GroupDto(
                    event.getOrgUnit().getId(),
                    event.getOrgUnit().getName()
            );
        }

        RoomDto roomDto = null;
        if (event.getRoom() != null) {
            roomDto = new RoomDto(
                event.getRoom().getId(),
                event.getRoom().getName()
            );
        }

        return new ScheduleEventDto(
                event.getId(),
                subjectDto,
                teacherDto,
                groupDto,
                roomDto,
                event.getStartAt(),
                event.getEndAt(),
                event.getStatus(),
                event.getPublicationStatus(),
                false,
                null,
                event.getDelayMinutes()
        );
    }

    @Transactional(readOnly = true)
    public List<ScheduleEventDto> getConflicts() {
        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now().plusMonths(6);
        List<ScheduleEvent> upcomingEvents = scheduleEventRepository.findByStartAtBetweenAndDeletedFalse(start, end);
        
        List<ScheduleEventDto> conflicts = new java.util.ArrayList<>();
        
        for (ScheduleEvent event : upcomingEvents) {
            boolean isRoomConflict = event.getRoom() != null && 
                scheduleEventRepository.existsOverlappingForRoomWithExclude(event.getRoom().getId(), event.getStartAt(), event.getEndAt(), event.getId());
            
            boolean isTeacherConflict = event.getTeacher() != null && 
                scheduleEventRepository.existsOverlappingForTeacherWithExclude(event.getTeacher().getId(), event.getStartAt(), event.getEndAt(), event.getId());
            
            boolean isOrgUnitConflict = event.getOrgUnit() != null && 
                scheduleEventRepository.existsOverlappingForOrgUnitWithExclude(event.getOrgUnit().getId(), event.getStartAt(), event.getEndAt(), event.getId());

            if (isRoomConflict || isTeacherConflict || isOrgUnitConflict) {
                ScheduleEventDto dto = mapToDto(event);
                dto.setConflict(true);
                String desc = "";
                if (isRoomConflict) desc += "Superposition de salle. ";
                if (isTeacherConflict) desc += "Professeur déjà occupé. ";
                if (isOrgUnitConflict) desc += "La classe a déjà cours. ";
                dto.setConflictDetails(desc.trim());
                conflicts.add(dto);
            }
        }
        return conflicts;
    }

    @Transactional
    public ScheduleEventDto createEvent(ScheduleEventCreateDto dto) {
        validateNoConflict(dto.getTeacherId(), dto.getRoomId(), dto.getOrgUnitId(), dto.getStartAt(), dto.getEndAt(), null);

        // Find existing course or create one
        Course course = courseRepository
                .findBySubjectIdAndTeacherIdAndOrgUnitIdAndDeletedFalse(dto.getSubjectId(), dto.getTeacherId(), dto.getOrgUnitId())
                .orElseGet(() -> {
                    Course newCourse = new Course();
                    
                    Subject subject = subjectRepository.findById(dto.getSubjectId())
                            .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
                    newCourse.setSubject(subject);
                    
                    Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
                    newCourse.setTeacher(teacher);
                    
                    OrganizationalUnit orgUnit = orgUnitRepository.findById(dto.getOrgUnitId())
                            .orElseThrow(() -> new ResourceNotFoundException("OrgUnit not found"));
                    newCourse.setOrgUnit(orgUnit);
                    
                    Institution institution = institutionRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
                    newCourse.setInstitution(institution);
                    newCourse.setTenantId(institution.getId());
                    
                    return courseRepository.save(newCourse);
                });

        ScheduleEvent event = new ScheduleEvent();
        event.setCourse(course);
        
        Teacher eventTeacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        event.setTeacher(eventTeacher);
        
        if (dto.getRoomId() != null) {
            Room room = roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
            event.setRoom(room);
        }
        
        event.setOrgUnit(course.getOrgUnit());
        event.setInstitution(course.getInstitution());
        event.setTenantId(course.getInstitution().getId());
        event.setStartAt(dto.getStartAt());
        event.setEndAt(dto.getEndAt());
        event.setStatus(dto.getStatus() != null ? dto.getStatus() : ga.gabedt.timetable.enums.EventStatus.SCHEDULED);
        event.setPublicationStatus(ga.gabedt.timetable.enums.PublicationStatus.DRAFT);
        event.setNotes(dto.getNotes());
        
        ScheduleEvent savedEvent = scheduleEventRepository.save(event);
        
        // Notification temps-réel
        notificationService.sendAdminAlert(
            "Emploi du temps mis à jour",
            "Un cours a été programmé pour " + course.getSubject().getName(),
            "INFO"
        );
        
        return mapToDto(savedEvent);
    }

    @Transactional
    public ScheduleEventDto updateEvent(UUID id, ScheduleEventCreateDto dto) {
        validateNoConflict(dto.getTeacherId(), dto.getRoomId(), dto.getOrgUnitId(), dto.getStartAt(), dto.getEndAt(), id);

        ScheduleEvent event = scheduleEventRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));

        if (!event.getCourse().getSubject().getId().equals(dto.getSubjectId()) || 
            !event.getCourse().getTeacher().getId().equals(dto.getTeacherId()) ||
            !event.getCourse().getOrgUnit().getId().equals(dto.getOrgUnitId())) {
            
            // Course has changed
            Course course = courseRepository
                .findBySubjectIdAndTeacherIdAndOrgUnitIdAndDeletedFalse(dto.getSubjectId(), dto.getTeacherId(), dto.getOrgUnitId())
                .orElseGet(() -> {
                    Course newCourse = new Course();
                    
                    Subject subject = subjectRepository.findById(dto.getSubjectId())
                            .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
                    newCourse.setSubject(subject);
                    
                    Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
                    newCourse.setTeacher(teacher);
                    
                    OrganizationalUnit orgUnit = orgUnitRepository.findById(dto.getOrgUnitId())
                            .orElseThrow(() -> new ResourceNotFoundException("OrgUnit not found"));
                    newCourse.setOrgUnit(orgUnit);
                    
                    Institution institution = institutionRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
                    newCourse.setInstitution(institution);
                    newCourse.setTenantId(institution.getId());
                    
                    return courseRepository.save(newCourse);
                });
            event.setCourse(course);
        }

        Teacher eventTeacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        event.setTeacher(eventTeacher);
        event.setOrgUnit(event.getCourse().getOrgUnit());

        if (dto.getRoomId() != null) {
            Room room = roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
            event.setRoom(room);
        } else {
            event.setRoom(null);
        }
        
        event.setStartAt(dto.getStartAt());
        event.setEndAt(dto.getEndAt());
        if (dto.getStatus() != null) event.setStatus(dto.getStatus());
        event.setNotes(dto.getNotes());
        
        ScheduleEvent savedEvent = scheduleEventRepository.save(event);
        return mapToDto(savedEvent);
    }

    @Transactional
    public ScheduleEventDto rescheduleEvent(UUID id, ScheduleEventRescheduleDto dto) {
        ScheduleEvent event = scheduleEventRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));

        UUID teacherId = event.getTeacher() != null ? event.getTeacher().getId() : null;
        UUID roomId = event.getRoom() != null ? event.getRoom().getId() : null;
        UUID orgUnitId = event.getOrgUnit() != null ? event.getOrgUnit().getId() : null;

        validateNoConflict(teacherId, roomId, orgUnitId, dto.getStartAt(), dto.getEndAt(), id);

        event.setStartAt(dto.getStartAt());
        event.setEndAt(dto.getEndAt());
        
        ScheduleEvent savedEvent = scheduleEventRepository.save(event);
        return mapToDto(savedEvent);
    }

    @Transactional
    public void deleteEvent(UUID id) {
        ScheduleEvent event = scheduleEventRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));
        
        event.setDeleted(true);
        scheduleEventRepository.save(event);
    }

    @Transactional
    public ScheduleEventDto reportDelay(UUID id, int minutes) {
        ScheduleEvent event = scheduleEventRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));

        event.setDelayMinutes(minutes);
        ScheduleEvent savedEvent = scheduleEventRepository.save(event);

        if (event.getOrgUnit() != null) {
            notificationService.sendClassAlert(
                event.getOrgUnit().getId(),
                "Retard signalé",
                "Le cours de " + event.getCourse().getSubject().getName() + " aura un retard de " + minutes + " minutes.",
                "WARNING"
            );
        }

        return mapToDto(savedEvent);
    }

    @Transactional
    public ScheduleEventDto cancelEvent(UUID id) {
        ScheduleEvent event = scheduleEventRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));

        event.setStatus(ga.gabedt.timetable.enums.EventStatus.CANCELLED);
        ScheduleEvent savedEvent = scheduleEventRepository.save(event);

        if (event.getOrgUnit() != null) {
            notificationService.sendClassAlert(
                event.getOrgUnit().getId(),
                "Cours annulé",
                "Le cours de " + event.getCourse().getSubject().getName() + " a été annulé.",
                "ERROR"
            );
        }

        return mapToDto(savedEvent);
    }

    private void validateNoConflict(UUID teacherId, UUID roomId, UUID orgUnitId, LocalDateTime start, LocalDateTime end, UUID excludeId) {
        if (teacherId != null) {
            boolean conflict = (excludeId == null) 
                ? scheduleEventRepository.existsOverlappingForTeacher(teacherId, start, end)
                : scheduleEventRepository.existsOverlappingForTeacherWithExclude(teacherId, start, end, excludeId);
            if (conflict) throw new ScheduleConflictException("L'enseignant est déjà occupé sur cette plage horaire.");
        }
        if (roomId != null) {
            boolean conflict = (excludeId == null)
                ? scheduleEventRepository.existsOverlappingForRoom(roomId, start, end)
                : scheduleEventRepository.existsOverlappingForRoomWithExclude(roomId, start, end, excludeId);
            if (conflict) throw new ScheduleConflictException("La salle est déjà réservée sur cette plage horaire.");
        }
        if (orgUnitId != null) {
            boolean conflict = (excludeId == null)
                ? scheduleEventRepository.existsOverlappingForOrgUnit(orgUnitId, start, end)
                : scheduleEventRepository.existsOverlappingForOrgUnitWithExclude(orgUnitId, start, end, excludeId);
            if (conflict) throw new ScheduleConflictException("Le groupe a déjà cours sur cette plage horaire.");
        }
    }
}

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
    private final ga.gabedt.tenant.CurrentTenant currentTenant;
    private final ga.gabedt.notification.NotificationService notificationService;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkStatusRepository homeworkStatusRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ga.gabedt.academic.AcademicCalendarService academicCalendarService;
    private final ga.gabedt.user.service.TeacherAvailabilityService teacherAvailabilityService;

    public List<ScheduleEventDto> searchEvents(UUID groupId, UUID teacherId, UUID roomId, LocalDate startDate, LocalDate endDate) {
        
 
        LocalDateTime start = (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = (endDate != null) ? endDate.atTime(23, 59, 59) : LocalDateTime.now().plusMonths(1);

        User caller = currentUserOrNull();
        // Élèves, parents et enseignants ne voient que l'emploi du temps publié ; les brouillons restent internes
        boolean publishedOnly = caller == null || !isPlanner(caller);
        // Élèves et parents : uniquement leurs classes (et les niveaux parents, ex. cours communs à la promotion).
        // Enseignants : uniquement leurs propres cours.
        // Exception : l'occupation d'une salle (scan du QR code sur la porte) reste consultable par tous.
        boolean roomOccupancy = roomId != null;
        java.util.Set<UUID> learnerOrgUnits = roomOccupancy ? null : learnerOrgUnitIds(caller);
        UUID ownTeacherId = roomOccupancy ? null : ownTeacherId(caller);
        if (learnerOrgUnits != null && learnerOrgUnits.isEmpty()) {
            return List.of();
        }

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
            if (publishedOnly) {
                predicates.add(cb.equal(root.get("publicationStatus"), ga.gabedt.timetable.enums.PublicationStatus.PUBLISHED));
            }
            if (learnerOrgUnits != null) {
                predicates.add(root.get("orgUnit").get("id").in(learnerOrgUnits));
            }
            if (ownTeacherId != null) {
                predicates.add(cb.equal(root.get("teacher").get("id"), ownTeacherId));
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

        populateHomework(dtos, caller);
        return dtos;
    }

    /** Devoirs des cours affichés, chargés en deux requêtes au total (et non deux par cours). */
    private void populateHomework(List<ScheduleEventDto> dtos, User caller) {
        if (caller == null || dtos.isEmpty()) return;
        boolean isLearner = caller.getRole() == ga.gabedt.common.enums.UserRole.STUDENT
                || caller.getRole() == ga.gabedt.common.enums.UserRole.PARENT;
        if (!isLearner && caller.getRole() != ga.gabedt.common.enums.UserRole.TEACHER) return;

        List<UUID> eventIds = dtos.stream().map(ScheduleEventDto::getId).toList();
        java.util.Map<UUID, Homework> homeworkByEvent = new java.util.HashMap<>();
        for (Homework hw : homeworkRepository.findByScheduleEventIds(eventIds)) {
            homeworkByEvent.merge(hw.getScheduleEvent().getId(), hw,
                    (a, b) -> a.getCreatedAt().isAfter(b.getCreatedAt()) ? a : b); // le plus récent
        }
        if (homeworkByEvent.isEmpty()) return;

        java.util.Set<UUID> doneHomeworkIds = java.util.Set.of();
        if (isLearner) {
            Student student = studentRepository.findByUserIdAndDeletedFalse(caller.getId()).orElse(null);
            if (student == null) return;
            doneHomeworkIds = homeworkStatusRepository
                    .findByStudentIdAndHomeworkIdInAndDeletedFalse(student.getId(),
                            homeworkByEvent.values().stream().map(Homework::getId).toList())
                    .stream().filter(HomeworkStatus::isCompleted)
                    .map(st -> st.getHomework().getId())
                    .collect(Collectors.toSet());
        }
        for (ScheduleEventDto dto : dtos) {
            Homework hw = homeworkByEvent.get(dto.getId());
            if (hw != null) {
                dto.setHomeworkId(hw.getId());
                dto.setHomeworkTitle(hw.getTitle());
                if (isLearner) {
                    dto.setHomeworkDone(doneHomeworkIds.contains(hw.getId()));
                }
            }
        }
    }

    private User currentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getPrincipal() instanceof User user) ? user : null;
    }

    /** Classes de l'élève et leurs unités parentes ; null si l'appelant n'est ni élève ni parent. */
    private java.util.Set<UUID> learnerOrgUnitIds(User caller) {
        if (caller == null || (caller.getRole() != ga.gabedt.common.enums.UserRole.STUDENT
                && caller.getRole() != ga.gabedt.common.enums.UserRole.PARENT)) {
            return null;
        }
        java.util.Set<UUID> ids = new java.util.HashSet<>();
        studentRepository.findByUserIdAndDeletedFalse(caller.getId()).ifPresent(student -> {
            for (ga.gabedt.structure.OrganizationalUnit unit : student.getOrgUnits()) {
                for (ga.gabedt.structure.OrganizationalUnit u = unit; u != null; u = u.getParent()) {
                    ids.add(u.getId());
                }
            }
        });
        return ids;
    }

    /** Identifiant enseignant de l'appelant ; null s'il n'est pas enseignant. */
    private UUID ownTeacherId(User caller) {
        if (caller == null || caller.getRole() != ga.gabedt.common.enums.UserRole.TEACHER) {
            return null;
        }
        return teacherRepository.findByUserIdAndDeletedFalse(caller.getId())
                .map(t -> t.getId())
                .orElse(new UUID(0L, 0L)); // enseignant sans fiche : aucun cours
    }

    private boolean isPlanner(User user) {
        return switch (user.getRole()) {
            case SUPER_ADMIN, SCHOOL_ADMIN, PEDAGOGICAL_MANAGER -> true;
            default -> false;
        };
    }

    /**
     * Publie les brouillons d'une classe sur une période : ils deviennent visibles pour
     * élèves, parents et enseignants, qui sont notifiés.
     */
    @Transactional
    public int publishEvents(UUID orgUnitId, LocalDate startDate, LocalDate endDate) {
        List<ScheduleEvent> events = scheduleEventRepository.findByOrgUnitIdAndStartAtBetweenAndDeletedFalse(
                orgUnitId, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        int published = 0;
        for (ScheduleEvent event : events) {
            if (event.getPublicationStatus() != ga.gabedt.timetable.enums.PublicationStatus.PUBLISHED) {
                event.setPublicationStatus(ga.gabedt.timetable.enums.PublicationStatus.PUBLISHED);
                published++;
            }
        }
        if (published > 0) {
            scheduleEventRepository.saveAll(events);
            notificationService.sendClassAlert(orgUnitId,
                    "Emploi du temps publié",
                    "L'emploi du temps du " + startDate + " au " + endDate + " est disponible.",
                    "INFO");
        }
        return published;
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
                event.getDelayMinutes(),
                null,
                null,
                false,
                event.getCourse() != null ? event.getCourse().getId() : null,
                event.getMakeUpOf() != null ? event.getMakeUpOf().getId() : null,
                event.getNotes()
        );
    }

    @Transactional(readOnly = true)
    public List<ScheduleEventDto> getConflicts() {
        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now().plusMonths(6);
        List<ScheduleEvent> upcomingEvents = scheduleEventRepository.findByStartAtBetweenAndDeletedFalse(start, end);
        
        List<ScheduleEventDto> conflicts = new java.util.ArrayList<>();
        
        for (ScheduleEvent event : upcomingEvents) {
            if (event.getStatus() == ga.gabedt.timetable.enums.EventStatus.CANCELLED) {
                continue; // une séance annulée n'occupe plus son créneau
            }
            boolean isRoomConflict = event.getRoom() != null && 
                scheduleEventRepository.existsOverlappingForRoomWithExclude(event.getRoom().getId(), event.getStartAt(), event.getEndAt(), event.getId());
            
            boolean isTeacherConflict = event.getTeacher() != null && 
                scheduleEventRepository.existsOverlappingForTeacherWithExclude(event.getTeacher().getId(), event.getStartAt(), event.getEndAt(), event.getId());
            
            boolean isOrgUnitConflict = event.getOrgUnit() != null && 
                scheduleEventRepository.existsOverlappingForOrgUnitWithExclude(event.getOrgUnit().getId(), event.getStartAt(), event.getEndAt(), event.getId());

            // Séance tombant sur une fermeture ajoutée après coup (sauf dérogation confirmée)
            java.util.Optional<String> closure = event.isAllowedDuringClosure()
                    ? java.util.Optional.empty()
                    : academicCalendarService.closureReason(event.getStartAt(), event.getEndAt());

            String unavailability = event.getTeacher() != null
                    ? teacherAvailabilityService.unavailabilityReason(event.getTeacher().getId(), event.getStartAt(), event.getEndAt())
                    : null;

            boolean isCapacityIssue = false;
            String capacityMsg = null;
            if (event.getRoom() != null && event.getRoom().getCapacity() != null && event.getOrgUnit() != null) {
                long studentCount = studentRepository.countByOrgUnits_IdAndDeletedFalse(event.getOrgUnit().getId());
                if (studentCount > event.getRoom().getCapacity()) {
                    isCapacityIssue = true;
                    capacityMsg = "Capacité insuffisante : " + studentCount + " élèves / " + event.getRoom().getCapacity() + " places.";
                }
            }

            if (isRoomConflict || isTeacherConflict || isOrgUnitConflict || closure.isPresent()
                    || unavailability != null || isCapacityIssue) {
                ScheduleEventDto dto = mapToDto(event);
                dto.setConflict(true);
                String desc = closure.map(reason -> reason + " ").orElse("");
                if (unavailability != null) desc += unavailability + " ";
                if (isRoomConflict) desc += "Superposition de salle. ";
                if (isTeacherConflict) desc += "Professeur déjà occupé. ";
                if (isOrgUnitConflict) desc += "La classe a déjà cours. ";
                if (isCapacityIssue) desc += capacityMsg + " ";
                dto.setConflictDetails(desc.trim());
                conflicts.add(dto);
            }
        }
        return conflicts;
    }

    @Transactional
    public ScheduleEventDto createEvent(ScheduleEventCreateDto dto) {
        ScheduleEvent makeUpOf = dto.getMakeUpOfId() != null ? resolveMakeUpOriginal(dto) : null;
        academicCalendarService.checkSchedulable(dto.getStartAt(), dto.getEndAt(), dto.isAllowDuringClosure());
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
                    
                    Institution institution = currentTenant.requireInstitution();
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
        event.setMakeUpOf(makeUpOf);
        event.setAllowedDuringClosure(dto.isAllowDuringClosure());

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
        academicCalendarService.checkSchedulable(dto.getStartAt(), dto.getEndAt(), dto.isAllowDuringClosure());
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
                    
                    Institution institution = currentTenant.requireInstitution();
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
        event.setAllowedDuringClosure(dto.isAllowDuringClosure());
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

        academicCalendarService.checkSchedulable(dto.getStartAt(), dto.getEndAt(), dto.isAllowDuringClosure());
        validateNoConflict(teacherId, roomId, orgUnitId, dto.getStartAt(), dto.getEndAt(), id);

        event.setStartAt(dto.getStartAt());
        event.setEndAt(dto.getEndAt());
        event.setAllowedDuringClosure(dto.isAllowDuringClosure());
        
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

    @Transactional
    public int cancelEventsByDate(UUID orgUnitId, LocalDate date, String reason) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        List<ScheduleEvent> events = scheduleEventRepository.findByOrgUnitIdAndStartAtBetweenAndDeletedFalse(orgUnitId, start, end);
        
        int canceledCount = 0;
        for (ScheduleEvent event : events) {
            if (event.getStatus() != ga.gabedt.timetable.enums.EventStatus.CANCELLED) {
                event.setStatus(ga.gabedt.timetable.enums.EventStatus.CANCELLED);
                event.setNotes((event.getNotes() != null ? event.getNotes() + " | " : "") + "Annulé pour cause de: " + reason);
                canceledCount++;
            }
        }
        
        if (canceledCount > 0) {
            scheduleEventRepository.saveAll(events);
            
            notificationService.sendClassAlert(
                orgUnitId,
                "Alerte : Cours annulés (" + reason + ")",
                "Tous les cours de la journée du " + date + " ont été annulés.",
                "ERROR"
            );
            // TODO: Intégrer l'envoi de SMS natif ici (Airtel/Moov) pour prévenir les parents
        }

        return canceledCount;
    }

    /**
     * Séance annulée à rattraper : doit être annulée, pas encore rattrapée, et la classe
     * déclarée doit être la sienne (le contrôle de droits porte sur cette classe).
     * Le rattrapage reprend la matière, l'enseignant et la classe de la séance d'origine.
     */
    private ScheduleEvent resolveMakeUpOriginal(ScheduleEventCreateDto dto) {
        ScheduleEvent original = scheduleEventRepository.findById(dto.getMakeUpOfId())
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Séance à rattraper introuvable"));
        if (original.getStatus() != ga.gabedt.timetable.enums.EventStatus.CANCELLED) {
            throw new ga.gabedt.common.exception.BusinessConflictException("NOT_CANCELLED", "Seule une séance annulée peut être rattrapée");
        }
        if (scheduleEventRepository.hasActiveMakeUp(original.getId())) {
            throw new ga.gabedt.common.exception.BusinessConflictException("ALREADY_MADE_UP", "Cette séance a déjà un rattrapage");
        }
        if (!original.getOrgUnit().getId().equals(dto.getOrgUnitId())) {
            throw new IllegalArgumentException("La classe du rattrapage doit être celle de la séance annulée");
        }
        Course course = original.getCourse();
        dto.setSubjectId(course.getSubject().getId());
        dto.setTeacherId(course.getTeacher().getId());
        dto.setOrgUnitId(course.getOrgUnit().getId());
        return original;
    }

    /** Séances annulées encore sans rattrapage, pour la file « Rattrapages ». */
    public List<ScheduleEventDto> getEventsToMakeUp(UUID orgUnitId, UUID teacherId) {
        return scheduleEventRepository.findCancelledWithoutMakeUp().stream()
                .filter(e -> orgUnitId == null || e.getOrgUnit().getId().equals(orgUnitId))
                .filter(e -> teacherId == null || e.getTeacher().getId().equals(teacherId))
                .map(this::mapToDto)
                .toList();
    }

    private void validateNoConflict(UUID teacherId, UUID roomId, UUID orgUnitId, LocalDateTime start, LocalDateTime end, UUID excludeId) {
        if (teacherId != null) {
            String unavailability = teacherAvailabilityService.unavailabilityReason(teacherId, start, end);
            if (unavailability != null) throw new ScheduleConflictException(unavailability);

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

            Room room = roomRepository.findById(roomId).orElse(null);
            if (room != null && room.getCapacity() != null && orgUnitId != null) {
                long studentCount = studentRepository.countByOrgUnits_IdAndDeletedFalse(orgUnitId);
                if (studentCount > room.getCapacity()) {
                    throw new ScheduleConflictException(
                            "Capacité insuffisante : " + studentCount + " élèves pour " + room.getCapacity() + " places (" + room.getName() + ").");
                }
            }
        }
        if (orgUnitId != null) {
            boolean conflict = (excludeId == null)
                ? scheduleEventRepository.existsOverlappingForOrgUnit(orgUnitId, start, end)
                : scheduleEventRepository.existsOverlappingForOrgUnitWithExclude(orgUnitId, start, end, excludeId);
            if (conflict) throw new ScheduleConflictException("Le groupe a déjà cours sur cette plage horaire.");
        }
    }
}

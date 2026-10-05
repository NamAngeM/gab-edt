package ga.gabedt.timetable.service;

import ga.gabedt.common.exception.BusinessConflictException;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.tenant.CurrentTenant;
import ga.gabedt.timetable.Course;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.dto.CourseSummaryDto;
import ga.gabedt.timetable.dto.CourseUpsertDto;
import ga.gabedt.timetable.dto.GroupDto;
import ga.gabedt.timetable.dto.SubjectDto;
import ga.gabedt.timetable.dto.TeacherDto;
import ga.gabedt.timetable.enums.EventStatus;
import ga.gabedt.timetable.repository.CourseRepository;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Répartition des enseignements (qui enseigne quoi, à quelle classe, combien d'heures)
 * et suivi prévu / planifié / réalisé / annulé / à rattraper.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final ScheduleEventRepository eventRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final OrganizationalUnitRepository orgUnitRepository;
    private final CurrentTenant currentTenant;

    public List<CourseSummaryDto> list(UUID orgUnitId, UUID teacherId, LocalDate from, LocalDate to) {
        List<Course> courses;
        if (orgUnitId != null && teacherId != null) {
            courses = courseRepository.findByTeacherIdAndOrgUnitIdAndDeletedFalse(teacherId, orgUnitId);
        } else if (orgUnitId != null) {
            courses = courseRepository.findByOrgUnitIdAndDeletedFalse(orgUnitId);
        } else if (teacherId != null) {
            courses = courseRepository.findByTeacherIdAndDeletedFalse(teacherId);
        } else {
            courses = courseRepository.findAllByDeletedFalse();
        }
        return summarize(courses, from, to);
    }

    /** Volume horaire de l'enseignant connecté. */
    public List<CourseSummaryDto> mine(LocalDate from, LocalDate to) {
        UUID userId = currentTenant.requireUser().getId();
        UUID teacherId = teacherRepository.findByUserIdAndDeletedFalse(userId)
                .orElseThrow(() -> new UnauthorizedAccessException("Aucune fiche enseignant associée à ce compte"))
                .getId();
        return summarize(courseRepository.findByTeacherIdAndDeletedFalse(teacherId), from, to);
    }

    @Transactional
    public CourseSummaryDto create(CourseUpsertDto dto) {
        if (courseRepository.findBySubjectIdAndTeacherIdAndOrgUnitIdAndDeletedFalse(
                dto.subjectId(), dto.teacherId(), dto.orgUnitId()).isPresent()) {
            throw new BusinessConflictException("COURSE_EXISTS", "Cet enseignement existe déjà pour cette classe");
        }
        Course course = new Course();
        course.setSubject(subjectRepository.findById(dto.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Matière introuvable")));
        course.setTeacher(teacherRepository.findById(dto.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable")));
        course.setOrgUnit(orgUnitRepository.findById(dto.orgUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Classe introuvable")));
        Institution institution = currentTenant.requireInstitution();
        course.setInstitution(institution);
        course.setTenantId(institution.getId());
        course.setPlannedHours(dto.plannedHours());
        return summarize(List.of(courseRepository.save(course)), null, null).get(0);
    }

    @Transactional
    public CourseSummaryDto updatePlannedHours(UUID id, Double plannedHours) {
        if (plannedHours != null && (plannedHours < 0 || plannedHours > 2000)) {
            throw new IllegalArgumentException("Volume prévu invalide");
        }
        Course course = findCourse(id);
        course.setPlannedHours(plannedHours);
        return summarize(List.of(courseRepository.save(course)), null, null).get(0);
    }

    @Transactional
    public void delete(UUID id) {
        Course course = findCourse(id);
        if (!eventRepository.findByCourseIds(List.of(id)).isEmpty()) {
            throw new BusinessConflictException("COURSE_HAS_SESSIONS",
                    "Des séances sont planifiées pour cet enseignement : supprimez-les d'abord");
        }
        course.setDeleted(true);
        courseRepository.save(course);
    }

    /** Classe d'un enseignement (contrôle de périmètre des responsables pédagogiques). */
    public UUID orgUnitOf(UUID courseId) {
        return findCourse(courseId).getOrgUnit().getId();
    }

    private Course findCourse(UUID id) {
        return courseRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Enseignement introuvable"));
    }

    private List<CourseSummaryDto> summarize(List<Course> courses, LocalDate from, LocalDate to) {
        if (courses.isEmpty()) return List.of();
        LocalDateTime start = from != null ? from.atStartOfDay() : null;
        LocalDateTime end = to != null ? to.plusDays(1).atStartOfDay() : null;
        LocalDateTime now = LocalDateTime.now();

        Map<UUID, List<ScheduleEvent>> eventsByCourse = eventRepository
                .findByCourseIds(courses.stream().map(Course::getId).toList()).stream()
                .filter(e -> (start == null || !e.getStartAt().isBefore(start)) && (end == null || e.getStartAt().isBefore(end)))
                .collect(Collectors.groupingBy(e -> e.getCourse().getId()));

        // Séances annulées déjà couvertes par un rattrapage actif
        Set<UUID> madeUpOriginals = new HashSet<>();
        eventsByCourse.values().stream().flatMap(List::stream)
                .filter(e -> e.getMakeUpOf() != null && e.getStatus() != EventStatus.CANCELLED)
                .forEach(e -> madeUpOriginals.add(e.getMakeUpOf().getId()));

        return courses.stream()
                .sorted(Comparator.comparing((Course c) -> c.getOrgUnit().getName())
                        .thenComparing(c -> c.getSubject().getName()))
                .map(course -> toSummary(course, eventsByCourse.getOrDefault(course.getId(), List.of()), madeUpOriginals, now))
                .toList();
    }

    private CourseSummaryDto toSummary(Course course, List<ScheduleEvent> events, Set<UUID> madeUpOriginals, LocalDateTime now) {
        double scheduled = 0, done = 0, cancelled = 0, madeUp = 0, toMakeUp = 0;
        for (ScheduleEvent e : events) {
            double hours = Duration.between(e.getStartAt(), e.getEndAt()).toMinutes() / 60.0;
            if (e.getStatus() == EventStatus.CANCELLED) {
                cancelled += hours;
                if (!madeUpOriginals.contains(e.getId())) toMakeUp += hours;
            } else {
                scheduled += hours;
                if (e.getEndAt().isBefore(now)) done += hours;
                if (e.getMakeUpOf() != null) madeUp += hours;
            }
        }
        Double planned = course.getPlannedHours();
        return new CourseSummaryDto(
                course.getId(),
                new SubjectDto(course.getSubject().getId(), course.getSubject().getName(), course.getSubject().getCode()),
                new TeacherDto(course.getTeacher().getId(), course.getTeacher().getUser().getFirstName(),
                        course.getTeacher().getUser().getLastName()),
                new GroupDto(course.getOrgUnit().getId(), course.getOrgUnit().getName()),
                planned,
                round(scheduled),
                round(done),
                round(cancelled),
                round(madeUp),
                round(toMakeUp),
                planned != null ? round(Math.max(0, planned - scheduled)) : null);
    }

    private static double round(double value) {
        return Math.round(value * 100) / 100.0;
    }
}

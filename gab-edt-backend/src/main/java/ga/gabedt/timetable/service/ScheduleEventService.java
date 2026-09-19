package ga.gabedt.timetable.service;

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

    public List<ScheduleEventDto> searchEvents(UUID groupId, UUID teacherId, UUID roomId, LocalDate startDate, LocalDate endDate) {
        
        LocalDateTime start = (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = (endDate != null) ? endDate.atTime(23, 59, 59) : LocalDateTime.now().plusMonths(1);
        
        List<ScheduleEvent> events = scheduleEventRepository.findByStartAtBetweenAndDeletedFalse(start, end);
        
        // Filtrage manuel pour simplifier
        return events.stream()
                .filter(e -> groupId == null || e.getOrgUnit().getId().equals(groupId))
                .filter(e -> teacherId == null || e.getTeacher().getId().equals(teacherId))
                .filter(e -> roomId == null || (e.getRoom() != null && e.getRoom().getId().equals(roomId)))
                .map(this::mapToDto)
                .collect(Collectors.toList());
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
                null
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
    public void deleteEvent(UUID id) {
        ScheduleEvent event = scheduleEventRepository.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));
        
        event.setDeleted(true);
        scheduleEventRepository.save(event);
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

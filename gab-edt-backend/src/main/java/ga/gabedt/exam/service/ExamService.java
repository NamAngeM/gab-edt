package ga.gabedt.exam.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.exam.Exam;
import ga.gabedt.exam.ExamSession;
import ga.gabedt.exam.dto.*;
import ga.gabedt.exam.repository.ExamRepository;
import ga.gabedt.exam.repository.ExamSessionRepository;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.timetable.dto.TeacherDto;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamService {

    private final ExamSessionRepository sessionRepository;
    private final ExamRepository examRepository;
    private final OrganizationalUnitRepository orgUnitRepository;
    private final ga.gabedt.tenant.CurrentTenant currentTenant;
    private final SubjectRepository subjectRepository;
    private final RoomRepository roomRepository;
    private final TeacherRepository teacherRepository;
    private final ga.gabedt.timetable.service.PlanningConflictService planningConflictService;

    public List<ExamSessionDto> getAllSessions() {
        return sessionRepository.findByDeletedFalse().stream()
                .map(s -> new ExamSessionDto(s.getId(), s.getName(), s.getStartDate(), s.getEndDate(), s.getOrgUnit().getId(), s.getOrgUnit().getName(), s.isPublished()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamSessionDto createSession(ExamSessionCreateDto dto) {
        OrganizationalUnit orgUnit = orgUnitRepository.findById(dto.orgUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("OrgUnit not found"));

        ExamSession session = new ExamSession();
        session.setName(dto.name());
        session.setStartDate(dto.startDate());
        session.setEndDate(dto.endDate());
        session.setOrgUnit(orgUnit);
        session.setInstitution(currentTenant.requireInstitution());
        session.setTenantId(session.getInstitution().getId());

        session = sessionRepository.save(session);
        return new ExamSessionDto(session.getId(), session.getName(), session.getStartDate(), session.getEndDate(), orgUnit.getId(), orgUnit.getName(), session.isPublished());
    }

    public List<ExamDto> getExamsForSession(UUID sessionId) {
        return examRepository.findBySessionIdAndDeletedFalse(sessionId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamDto createExam(ExamCreateDto dto) {
        planningConflictService.validateExam(dto.roomId(), dto.supervisorIds(), dto.startAt(), dto.endAt(), null);

        ExamSession session = sessionRepository.findById(dto.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        Subject subject = subjectRepository.findById(dto.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        Exam exam = new Exam();
        exam.setSession(session);
        exam.setSubject(subject);
        exam.setStartAt(dto.startAt());
        exam.setEndAt(dto.endAt());
        exam.setInstitution(session.getInstitution());
        exam.setTenantId(session.getTenantId());

        if (dto.roomId() != null) {
            Room room = roomRepository.findById(dto.roomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
            exam.setRoom(room);
        }

        if (dto.supervisorIds() != null && !dto.supervisorIds().isEmpty()) {
            Set<Teacher> supervisors = new HashSet<>(teacherRepository.findAllById(dto.supervisorIds()));
            exam.setSupervisors(supervisors);
        }

        exam = examRepository.save(exam);
        return mapToDto(exam);
    }

    @Transactional
    public void deleteExam(UUID id) {
        Exam exam = examRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        exam.setDeleted(true);
        examRepository.save(exam);
    }

    private ExamDto mapToDto(Exam exam) {
        List<TeacherDto> supervisors = exam.getSupervisors().stream()
                .map(t -> new TeacherDto(t.getId(), t.getUser().getFirstName(), t.getUser().getLastName()))
                .collect(Collectors.toList());

        return new ExamDto(
                exam.getId(),
                exam.getSession().getId(),
                exam.getSubject().getId(),
                exam.getSubject().getName(),
                exam.getRoom() != null ? exam.getRoom().getId() : null,
                exam.getRoom() != null ? exam.getRoom().getName() : null,
                exam.getStartAt(),
                exam.getEndAt(),
                supervisors
        );
    }
}

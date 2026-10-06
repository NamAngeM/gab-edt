package ga.gabedt.defense.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.defense.Defense;
import ga.gabedt.defense.dto.DefenseCreateDto;
import ga.gabedt.defense.dto.DefenseDto;
import ga.gabedt.defense.repository.DefenseRepository;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.timetable.dto.TeacherDto;
import ga.gabedt.user.Student;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefenseService {

    private final DefenseRepository defenseRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final TeacherRepository teacherRepository;
    private final ga.gabedt.tenant.CurrentTenant currentTenant;
    private final ga.gabedt.timetable.service.PlanningConflictService planningConflictService;

    public List<DefenseDto> getAllDefenses() {
        return defenseRepository.findByDeletedFalse().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DefenseDto createDefense(DefenseCreateDto dto) {
        planningConflictService.validateDefense(dto.roomId(), dto.presidentId(), dto.examinerId(), dto.reporterId(),
                dto.startAt(), dto.endAt(), null);

        Student student = studentRepository.findById(dto.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Defense defense = new Defense();
        defense.setStudent(student);
        defense.setTopic(dto.topic());
        defense.setStartAt(dto.startAt());
        defense.setEndAt(dto.endAt());
        
        Institution institution = currentTenant.requireInstitution();
        defense.setInstitution(institution);
        defense.setTenantId(institution.getId());

        if (dto.roomId() != null) {
            Room room = roomRepository.findById(dto.roomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
            defense.setRoom(room);
        }

        if (dto.presidentId() != null) {
            Teacher president = teacherRepository.findById(dto.presidentId())
                    .orElseThrow(() -> new ResourceNotFoundException("President not found"));
            defense.setPresident(president);
        }

        if (dto.examinerId() != null) {
            Teacher examiner = teacherRepository.findById(dto.examinerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Examiner not found"));
            defense.setExaminer(examiner);
        }

        if (dto.reporterId() != null) {
            Teacher reporter = teacherRepository.findById(dto.reporterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));
            defense.setReporter(reporter);
        }

        defense = defenseRepository.save(defense);
        return mapToDto(defense);
    }

    @Transactional
    public void deleteDefense(UUID id) {
        Defense defense = defenseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Defense not found"));
        defense.setDeleted(true);
        defenseRepository.save(defense);
    }

    private DefenseDto mapToDto(Defense defense) {
        TeacherDto president = defense.getPresident() != null ? new TeacherDto(defense.getPresident().getId(), defense.getPresident().getUser().getFirstName(), defense.getPresident().getUser().getLastName()) : null;
        TeacherDto examiner = defense.getExaminer() != null ? new TeacherDto(defense.getExaminer().getId(), defense.getExaminer().getUser().getFirstName(), defense.getExaminer().getUser().getLastName()) : null;
        TeacherDto reporter = defense.getReporter() != null ? new TeacherDto(defense.getReporter().getId(), defense.getReporter().getUser().getFirstName(), defense.getReporter().getUser().getLastName()) : null;

        return new DefenseDto(
                defense.getId(),
                defense.getStudent().getId(),
                defense.getStudent().getUser().getFirstName() + " " + defense.getStudent().getUser().getLastName(),
                defense.getTopic(),
                defense.getRoom() != null ? defense.getRoom().getId() : null,
                defense.getRoom() != null ? defense.getRoom().getName() : null,
                defense.getStartAt(),
                defense.getEndAt(),
                president,
                examiner,
                reporter
        );
    }
}

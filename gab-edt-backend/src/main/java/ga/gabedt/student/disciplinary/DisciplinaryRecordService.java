package ga.gabedt.student.disciplinary;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.student.disciplinary.dto.DisciplinaryRecordCreateDto;
import ga.gabedt.student.disciplinary.dto.DisciplinaryRecordDto;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisciplinaryRecordService {

    private final DisciplinaryRecordRepository repository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Transactional
    public DisciplinaryRecordDto createRecord(DisciplinaryRecordCreateDto dto) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User reporter = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new UnauthorizedAccessException("Utilisateur introuvable"));

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Élève introuvable"));

        DisciplinaryRecord record = new DisciplinaryRecord();
        record.setStudent(student);
        record.setReportedBy(reporter);
        record.setType(dto.getType());
        record.setDescription(dto.getDescription());
        record.setIncidentDate(dto.getIncidentDate());
        record.setTenantId(student.getTenantId());

        DisciplinaryRecord saved = repository.save(record);
        
        // TODO: Envoi de SMS natif aux parents (Airtel/Moov) si type est CONVOCATION ou BLAME
        if (record.getType() == DisciplinaryType.CONVOCATION_PARENT || record.getType() == DisciplinaryType.BLAME) {
            log.info("MOCK SMS: Envoi de SMS aux parents de {} pour motif: {}", student.getUser().getLastName(), record.getType());
        }
        
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<DisciplinaryRecordDto> getStudentRecords(UUID studentId) {
        return repository.findByStudentIdAndDeletedFalseOrderByIncidentDateDesc(studentId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DisciplinaryRecordDto> getAllRecords() {
        return repository.findByDeletedFalseOrderByIncidentDateDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DisciplinaryRecordDto signRecord(UUID recordId, String signatureCode) {
        DisciplinaryRecord record = repository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Enregistrement introuvable"));
        
        // Simuler la validation d'un code SMS ou signature parente
        record.setParentSignature(signatureCode);
        record.setSignedAt(LocalDateTime.now());
        
        return mapToDto(repository.save(record));
    }

    private DisciplinaryRecordDto mapToDto(DisciplinaryRecord record) {
        DisciplinaryRecordDto dto = new DisciplinaryRecordDto();
        dto.setId(record.getId());
        dto.setStudentId(record.getStudent().getId());
        dto.setStudentName(record.getStudent().getUser().getFirstName() + " " + record.getStudent().getUser().getLastName());
        dto.setReportedById(record.getReportedBy().getId());
        dto.setReportedByName(record.getReportedBy().getFirstName() + " " + record.getReportedBy().getLastName());
        dto.setType(record.getType());
        dto.setDescription(record.getDescription());
        dto.setIncidentDate(record.getIncidentDate());
        dto.setSigned(record.getParentSignature() != null);
        dto.setSignedAt(record.getSignedAt());
        return dto;
    }
}

package ga.gabedt.resource.service;

import ga.gabedt.common.exception.BusinessConflictException;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.dto.SubjectCreateDto;
import ga.gabedt.resource.dto.SubjectUpdateDto;
import ga.gabedt.resource.dto.SubjectDto;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final OrganizationalUnitRepository orgUnitRepository;
    private final InstitutionRepository institutionRepository;

    public List<SubjectDto> getAllSubjects() {
        return subjectRepository.findAllByDeletedFalse().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubjectDto createSubject(SubjectCreateDto dto) {
        if (dto.getCode() != null && !dto.getCode().isBlank()) {
            subjectRepository.findByCodeAndDeletedFalse(dto.getCode())
                    .ifPresent(s -> {
                        throw new BusinessConflictException("CODE_EXISTS", "Une matière avec ce code existe déjà.");
                    });
        }

        Subject subject = new Subject();
        subject.setName(dto.getName());
        subject.setCode(dto.getCode());

        if (dto.getOrgUnitId() != null) {
            OrganizationalUnit orgUnit = orgUnitRepository.findById(dto.getOrgUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unité organisationnelle non trouvée"));
            subject.setOrgUnit(orgUnit);
        }

        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Établissement non trouvé"));
        subject.setInstitution(institution);
        subject.setTenantId(institution.getId());

        Subject saved = subjectRepository.save(subject);
        return mapToDto(saved);
    }

    @Transactional
    public SubjectDto updateSubject(UUID id, SubjectUpdateDto dto) {
        Subject subject = subjectRepository.findById(id)
                .filter(s -> !s.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée"));

        if (dto.getCode() != null && !dto.getCode().isBlank() && !dto.getCode().equals(subject.getCode())) {
            subjectRepository.findByCodeAndDeletedFalse(dto.getCode())
                    .ifPresent(s -> {
                        throw new BusinessConflictException("CODE_EXISTS", "Une matière avec ce code existe déjà.");
                    });
        }

        subject.setName(dto.getName());
        subject.setCode(dto.getCode());

        if (dto.getOrgUnitId() != null) {
            OrganizationalUnit orgUnit = orgUnitRepository.findById(dto.getOrgUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unité organisationnelle non trouvée"));
            subject.setOrgUnit(orgUnit);
        } else {
            subject.setOrgUnit(null);
        }

        Subject saved = subjectRepository.save(subject);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteSubject(UUID id) {
        Subject subject = subjectRepository.findById(id)
                .filter(s -> !s.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée"));

        subject.setDeleted(true);
        subjectRepository.save(subject);
    }

    private SubjectDto mapToDto(Subject subject) {
        SubjectDto dto = new SubjectDto();
        dto.setId(subject.getId());
        dto.setName(subject.getName());
        dto.setCode(subject.getCode());
        
        if (subject.getOrgUnit() != null) {
            SubjectDto.OrgUnitSimpleDto orgDto = new SubjectDto.OrgUnitSimpleDto();
            orgDto.setId(subject.getOrgUnit().getId());
            orgDto.setName(subject.getOrgUnit().getName());
            dto.setOrgUnit(orgDto);
        }
        
        return dto;
    }
}

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

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

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

    @Transactional
    public int importCsv(MultipartFile file) {
        int count = 0;
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build())) {

            List<Subject> subjectsToSave = new ArrayList<>();
            
            Institution inst = institutionRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No Institution available"));

            for (CSVRecord record : csvParser) {
                String name = record.isSet("Nom") ? record.get("Nom").trim() : (record.isSet("name") ? record.get("name").trim() : null);
                if (name == null || name.isEmpty()) continue;
                
                String code = record.isSet("Code") ? record.get("Code").trim() : (record.isSet("code") ? record.get("code").trim() : "");
                
                // Ignorer si le code existe déjà pour éviter les duplicatas
                if (!code.isEmpty() && subjectRepository.findByCodeAndDeletedFalse(code).isPresent()) {
                    continue;
                }
                
                Subject subject = new Subject();
                subject.setName(name);
                subject.setCode(code);
                
                subject.setInstitution(inst);
                subject.setTenantId(inst.getId());
                
                subjectsToSave.add(subject);
                count++;
            }
            
            subjectRepository.saveAll(subjectsToSave);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'analyse du fichier CSV: " + e.getMessage());
        }
        return count;
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

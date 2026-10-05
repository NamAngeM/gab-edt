package ga.gabedt.academic;

import ga.gabedt.academic.dto.*;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicYearService {

    private final AcademicYearRepository academicYearRepository;
    private final InstitutionRepository institutionRepository;

    @Transactional
    public AcademicYearDto createAcademicYear(AcademicYearCreateDto dto) {
        Institution institution = institutionRepository.findById(dto.institutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution", "id", dto.institutionId().toString()));

        AcademicYear year = new AcademicYear();
        year.setName(dto.name());
        year.setStartDate(dto.startDate());
        year.setEndDate(dto.endDate());
        year.setInstitution(institution);
        // Tenant is managed by Interceptor or can be set explicitly if needed
        year.setTenantId(institution.getId());

        if (dto.periods() != null) {
            for (AcademicPeriodCreateDto periodDto : dto.periods()) {
                AcademicPeriod period = new AcademicPeriod();
                period.setName(periodDto.name());
                period.setPeriodType(periodDto.periodType());
                period.setStartDate(periodDto.startDate());
                period.setEndDate(periodDto.endDate());
                period.setOrderIndex(periodDto.orderIndex());
                period.setAcademicYear(year);
                year.getPeriods().add(period);
            }
        }

        AcademicYear saved = academicYearRepository.save(year);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AcademicYearDto> getAcademicYearsByInstitution(UUID institutionId) {
        return academicYearRepository.findByInstitutionIdAndDeletedFalseOrderByStartDateDesc(institutionId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademicYearDto getAcademicYear(UUID id) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicYear", "id", id.toString()));
        return mapToDto(year);
    }

    private AcademicYearDto mapToDto(AcademicYear year) {
        AcademicYearDto dto = new AcademicYearDto();
        dto.setId(year.getId());
        dto.setName(year.getName());
        dto.setStartDate(year.getStartDate());
        dto.setEndDate(year.getEndDate());
        dto.setStatus(year.getStatus());
        dto.setInstitutionId(year.getInstitution().getId());
        
        List<AcademicPeriodDto> periodDtos = year.getPeriods().stream().map(period -> {
            AcademicPeriodDto pdto = new AcademicPeriodDto();
            pdto.setId(period.getId());
            pdto.setName(period.getName());
            pdto.setPeriodType(period.getPeriodType());
            pdto.setStartDate(period.getStartDate());
            pdto.setEndDate(period.getEndDate());
            pdto.setOrderIndex(period.getOrderIndex());
            return pdto;
        }).collect(Collectors.toList());
        
        dto.setPeriods(periodDtos);
        return dto;
    }
}

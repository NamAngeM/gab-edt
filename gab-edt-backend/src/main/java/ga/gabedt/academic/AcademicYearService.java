package ga.gabedt.academic;

import ga.gabedt.academic.dto.AcademicPeriodCreateDto;
import ga.gabedt.academic.dto.AcademicPeriodDto;
import ga.gabedt.academic.dto.AcademicYearCreateDto;
import ga.gabedt.academic.dto.AcademicYearDto;
import ga.gabedt.common.exception.BusinessConflictException;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.communication.AcademicEvent;
import ga.gabedt.communication.repository.AcademicEventRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.tenant.CurrentTenant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Années académiques de l'établissement courant et leurs périodes (semestres, trimestres).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AcademicYearService {

    private final AcademicYearRepository academicYearRepository;
    private final AcademicEventRepository academicEventRepository;
    private final CurrentTenant currentTenant;

    public List<AcademicYearDto> list() {
        return academicYearRepository.findByDeletedFalseOrderByStartDateDesc().stream().map(this::mapToDto).toList();
    }

    /** Année contenant la date du jour, sinon la plus récente. */
    public Optional<AcademicYearDto> current() {
        LocalDate today = LocalDate.now();
        List<AcademicYear> years = academicYearRepository.findByDeletedFalseOrderByStartDateDesc();
        return years.stream()
                .filter(y -> !today.isBefore(y.getStartDate()) && !today.isAfter(y.getEndDate()))
                .findFirst()
                .or(() -> years.stream().findFirst())
                .map(this::mapToDto);
    }

    public AcademicYearDto get(UUID id) {
        return mapToDto(find(id));
    }

    @Transactional
    public AcademicYearDto create(AcademicYearCreateDto dto) {
        validate(dto, null);
        Institution institution = currentTenant.requireInstitution();
        AcademicYear year = new AcademicYear();
        year.setInstitution(institution);
        year.setTenantId(institution.getId());
        apply(year, dto);
        return mapToDto(academicYearRepository.save(year));
    }

    @Transactional
    public AcademicYearDto update(UUID id, AcademicYearCreateDto dto) {
        AcademicYear year = find(id);
        validate(dto, id);
        apply(year, dto);
        return mapToDto(academicYearRepository.save(year));
    }

    @Transactional
    public void delete(UUID id) {
        AcademicYear year = find(id);
        year.setDeleted(true);
        academicYearRepository.save(year);
    }

    /**
     * Ajoute les jours fériés du Gabon de l'année civile comme fermetures (sans doublons).
     * @return nombre de jours ajoutés
     */
    @Transactional
    public int addPublicHolidays(int year) {
        Institution institution = currentTenant.requireInstitution();
        List<AcademicEvent> existing = academicEventRepository.findByDeletedFalseOrderByStartDateAsc();
        int added = 0;
        for (AcademicCalendarService.PublicHoliday holiday : AcademicCalendarService.gabonPublicHolidays(year)) {
            boolean alreadyThere = existing.stream().anyMatch(e -> e.isHoliday()
                    && !holiday.date().isBefore(e.getStartDate().toLocalDate())
                    && holiday.date().isBefore(e.getEndDate().toLocalDate().plusDays(e.getEndDate().toLocalTime().equals(java.time.LocalTime.MIDNIGHT) ? 0 : 1)));
            if (alreadyThere) continue;
            AcademicEvent event = new AcademicEvent();
            event.setTitle(holiday.title());
            event.setDescription("Jour férié");
            event.setStartDate(holiday.date().atStartOfDay());
            event.setEndDate(holiday.date().plusDays(1).atStartOfDay());
            event.setHoliday(true);
            event.setInstitution(institution);
            event.setTenantId(institution.getId());
            academicEventRepository.save(event);
            added++;
        }
        return added;
    }

    private AcademicYear find(UUID id) {
        return academicYearRepository.findById(id)
                .filter(y -> !y.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Année académique introuvable"));
    }

    private void validate(AcademicYearCreateDto dto, UUID excludeId) {
        if (!dto.endDate().isAfter(dto.startDate())) {
            throw new IllegalArgumentException("La fin de l'année doit être postérieure à son début");
        }
        boolean overlaps = academicYearRepository.findByDeletedFalseOrderByStartDateDesc().stream()
                .filter(y -> !y.getId().equals(excludeId))
                .anyMatch(y -> !dto.startDate().isAfter(y.getEndDate()) && !dto.endDate().isBefore(y.getStartDate()));
        if (overlaps) {
            throw new BusinessConflictException("YEAR_OVERLAP", "Cette année chevauche une année académique existante");
        }
        if (dto.periods() == null) return;
        List<AcademicPeriodCreateDto> periods = dto.periods().stream()
                .sorted(Comparator.comparing(AcademicPeriodCreateDto::startDate)).toList();
        for (int i = 0; i < periods.size(); i++) {
            AcademicPeriodCreateDto p = periods.get(i);
            if (p.endDate().isBefore(p.startDate())) {
                throw new IllegalArgumentException("Période « " + p.name() + " » : la fin précède le début");
            }
            if (p.startDate().isBefore(dto.startDate()) || p.endDate().isAfter(dto.endDate())) {
                throw new IllegalArgumentException("Période « " + p.name() + " » : hors de l'année académique");
            }
            if (i > 0 && !p.startDate().isAfter(periods.get(i - 1).endDate())) {
                throw new IllegalArgumentException("Les périodes « " + periods.get(i - 1).name() + " » et « " + p.name() + " » se chevauchent");
            }
        }
    }

    private void apply(AcademicYear year, AcademicYearCreateDto dto) {
        year.setName(dto.name());
        year.setStartDate(dto.startDate());
        year.setEndDate(dto.endDate());
        year.getPeriods().clear();
        if (dto.periods() != null) {
            int index = 1;
            for (AcademicPeriodCreateDto periodDto : dto.periods().stream()
                    .sorted(Comparator.comparing(AcademicPeriodCreateDto::startDate)).toList()) {
                AcademicPeriod period = new AcademicPeriod();
                period.setName(periodDto.name());
                period.setPeriodType(periodDto.periodType());
                period.setStartDate(periodDto.startDate());
                period.setEndDate(periodDto.endDate());
                period.setOrderIndex(periodDto.orderIndex() != null ? periodDto.orderIndex() : index);
                period.setAcademicYear(year);
                year.getPeriods().add(period);
                index++;
            }
        }
    }

    private AcademicYearDto mapToDto(AcademicYear year) {
        AcademicYearDto dto = new AcademicYearDto();
        dto.setId(year.getId());
        dto.setName(year.getName());
        dto.setStartDate(year.getStartDate());
        dto.setEndDate(year.getEndDate());
        dto.setStatus(year.getStatus());
        dto.setInstitutionId(year.getInstitution().getId());
        dto.setPeriods(year.getPeriods().stream()
                .filter(p -> !p.isDeleted())
                .sorted(Comparator.comparing(AcademicPeriod::getStartDate))
                .map(period -> {
                    AcademicPeriodDto pdto = new AcademicPeriodDto();
                    pdto.setId(period.getId());
                    pdto.setName(period.getName());
                    pdto.setPeriodType(period.getPeriodType());
                    pdto.setStartDate(period.getStartDate());
                    pdto.setEndDate(period.getEndDate());
                    pdto.setOrderIndex(period.getOrderIndex());
                    return pdto;
                }).toList());
        return dto;
    }
}

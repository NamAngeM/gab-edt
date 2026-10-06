package ga.gabedt.user.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.tenant.CurrentTenant;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherAvailability;
import ga.gabedt.user.TeacherAvailabilityRepository;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.dto.TeacherAvailabilityDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherAvailabilityService {

    private final TeacherAvailabilityRepository repository;
    private final TeacherRepository teacherRepository;
    private final CurrentTenant currentTenant;

    public List<TeacherAvailabilityDto> getAvailabilities(UUID teacherId) {
        return repository.findByTeacherIdAndDeletedFalse(teacherId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<TeacherAvailabilityDto> replaceAvailabilities(UUID teacherId, List<TeacherAvailabilityDto> slots) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable"));

        for (TeacherAvailabilityDto slot : slots) {
            if (slot.getStartTime() == null || slot.getEndTime() == null || slot.getDayOfWeek() == null) {
                throw new IllegalArgumentException("Chaque créneau doit avoir un jour, une heure de début et de fin");
            }
            if (!slot.getEndTime().isAfter(slot.getStartTime())) {
                throw new IllegalArgumentException("L'heure de fin doit être après l'heure de début");
            }
        }

        List<TeacherAvailability> existing = repository.findByTeacherIdAndDeletedFalse(teacherId);
        for (TeacherAvailability a : existing) {
            a.setDeleted(true);
        }
        repository.saveAll(existing);

        UUID tenantId = currentTenant.requireTenantId();
        List<TeacherAvailability> created = slots.stream().map(dto -> {
            TeacherAvailability a = new TeacherAvailability();
            a.setTeacher(teacher);
            a.setDayOfWeek(dto.getDayOfWeek());
            a.setStartTime(dto.getStartTime());
            a.setEndTime(dto.getEndTime());
            a.setTenantId(tenantId);
            return a;
        }).toList();

        return repository.saveAll(created).stream().map(this::toDto).toList();
    }

    /**
     * Vérifie si l'enseignant est disponible sur un créneau donné.
     * Retourne null si disponible, ou un message explicatif sinon.
     * Un enseignant sans créneaux définis est considéré disponible (titulaire).
     */
    public String unavailabilityReason(UUID teacherId, LocalDateTime start, LocalDateTime end) {
        List<TeacherAvailability> slots = repository.findByTeacherIdAndDeletedFalse(teacherId);
        if (slots.isEmpty()) return null;

        DayOfWeek eventDay = start.getDayOfWeek();
        LocalTime eventStart = start.toLocalTime();
        LocalTime eventEnd = end.toLocalTime();

        boolean covered = slots.stream()
                .filter(s -> s.getDayOfWeek() == eventDay)
                .anyMatch(s -> !s.getStartTime().isAfter(eventStart) && !s.getEndTime().isBefore(eventEnd));

        if (covered) return null;

        String dayName = eventDay.getDisplayName(TextStyle.FULL, Locale.FRANCE);
        List<DayOfWeek> availableDays = slots.stream().map(TeacherAvailability::getDayOfWeek).distinct().sorted().toList();
        String daysStr = availableDays.stream()
                .map(d -> d.getDisplayName(TextStyle.SHORT, Locale.FRANCE))
                .reduce((a, b) -> a + ", " + b)
                .orElse("");

        return "Enseignant indisponible le " + dayName + " (présent : " + daysStr + ").";
    }

    private TeacherAvailabilityDto toDto(TeacherAvailability a) {
        return new TeacherAvailabilityDto(a.getId(), a.getDayOfWeek(), a.getStartTime(), a.getEndTime());
    }
}

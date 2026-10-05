package ga.gabedt.academic;

import ga.gabedt.common.exception.ClosedPeriodException;
import ga.gabedt.communication.AcademicEvent;
import ga.gabedt.communication.repository.AcademicEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Calendrier de l'établissement : années académiques et fermetures (jours fériés, vacances).
 * Une séance ne peut être planifiée ni pendant une fermeture, ni hors de l'année académique
 * (dès qu'au moins une année est définie), sauf dérogation explicite.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AcademicCalendarService {

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("EEEE d MMMM yyyy", Locale.FRENCH);

    private final AcademicYearRepository academicYearRepository;
    private final AcademicEventRepository academicEventRepository;

    /** Raison pour laquelle la plage n'est pas planifiable, ou vide si elle l'est. */
    public Optional<String> closureReason(LocalDateTime start, LocalDateTime end) {
        List<AcademicEvent> closures = academicEventRepository.findClosuresOverlapping(start, end);
        if (!closures.isEmpty()) {
            return Optional.of("Établissement fermé le " + start.format(DAY) + " : " + closures.get(0).getTitle() + ".");
        }
        List<AcademicYear> years = academicYearRepository.findByDeletedFalseOrderByStartDateDesc();
        if (!years.isEmpty()) {
            LocalDate day = start.toLocalDate();
            boolean inYear = years.stream().anyMatch(y -> !day.isBefore(y.getStartDate()) && !day.isAfter(y.getEndDate()));
            if (!inYear) {
                return Optional.of("Le " + start.format(DAY) + " est en dehors de l'année académique.");
            }
        }
        return Optional.empty();
    }

    /** Refuse la plage si elle tombe pendant une fermeture, sauf dérogation. */
    public void checkSchedulable(LocalDateTime start, LocalDateTime end, boolean allowDuringClosure) {
        if (allowDuringClosure) return;
        closureReason(start, end).ifPresent(reason -> {
            throw new ClosedPeriodException(reason + " Confirmez pour planifier quand même (ex. rattrapage).");
        });
    }

    /**
     * Jours fériés du Gabon calculables pour une année civile : dates fixes et fêtes liées à Pâques.
     * L'Aïd el-Fitr et la Tabaski (calendrier lunaire) ne sont pas incluses et doivent être
     * ajoutées par l'établissement ; la liste est à vérifier chaque année (décrets).
     */
    public static List<PublicHoliday> gabonPublicHolidays(int year) {
        LocalDate easter = easterSunday(year);
        List<PublicHoliday> holidays = new ArrayList<>();
        holidays.add(new PublicHoliday(LocalDate.of(year, 1, 1), "Jour de l'An"));
        holidays.add(new PublicHoliday(easter.plusDays(1), "Lundi de Pâques"));
        holidays.add(new PublicHoliday(LocalDate.of(year, 4, 17), "Journée des droits de la femme"));
        holidays.add(new PublicHoliday(LocalDate.of(year, 5, 1), "Fête du Travail"));
        holidays.add(new PublicHoliday(easter.plusDays(50), "Lundi de Pentecôte"));
        holidays.add(new PublicHoliday(LocalDate.of(year, 8, 15), "Assomption"));
        holidays.add(new PublicHoliday(LocalDate.of(year, 8, 16), "Fête de l'Indépendance"));
        holidays.add(new PublicHoliday(LocalDate.of(year, 8, 17), "Fête de l'Indépendance"));
        holidays.add(new PublicHoliday(LocalDate.of(year, 11, 1), "Toussaint"));
        holidays.add(new PublicHoliday(LocalDate.of(year, 12, 25), "Noël"));
        return holidays;
    }

    /** Dimanche de Pâques (algorithme grégorien de Meeus/Jones/Butcher). */
    static LocalDate easterSunday(int year) {
        int a = year % 19;
        int b = year / 100;
        int c = year % 100;
        int d = b / 4;
        int e = b % 4;
        int f = (b + 8) / 25;
        int g = (b - f + 1) / 3;
        int h = (19 * a + b - d - g + 15) % 30;
        int i = c / 4;
        int k = c % 4;
        int l = (32 + 2 * e + 2 * i - h - k) % 7;
        int m = (a + 11 * h + 22 * l) / 451;
        int month = (h + l - 7 * m + 114) / 31;
        int day = ((h + l - 7 * m + 114) % 31) + 1;
        return LocalDate.of(year, month, day);
    }

    public record PublicHoliday(LocalDate date, String title) {}
}

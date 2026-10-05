package ga.gabedt.academic;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AcademicCalendarServiceTest {

    @Test
    void computesEasterSunday() {
        assertThat(AcademicCalendarService.easterSunday(2024)).isEqualTo(LocalDate.of(2024, 3, 31));
        assertThat(AcademicCalendarService.easterSunday(2025)).isEqualTo(LocalDate.of(2025, 4, 20));
        assertThat(AcademicCalendarService.easterSunday(2026)).isEqualTo(LocalDate.of(2026, 4, 5));
        assertThat(AcademicCalendarService.easterSunday(2027)).isEqualTo(LocalDate.of(2027, 3, 28));
    }

    @Test
    void listsGabonPublicHolidaysWithMovableFeasts() {
        List<AcademicCalendarService.PublicHoliday> holidays = AcademicCalendarService.gabonPublicHolidays(2026);

        assertThat(holidays).extracting(AcademicCalendarService.PublicHoliday::date).contains(
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 4, 6),   // lundi de Pâques
                LocalDate.of(2026, 4, 17),
                LocalDate.of(2026, 5, 25),  // lundi de Pentecôte
                LocalDate.of(2026, 8, 16),
                LocalDate.of(2026, 8, 17),
                LocalDate.of(2026, 12, 25));
        assertThat(holidays).hasSize(10);
    }
}

package ga.gabedt.academic;

import ga.gabedt.academic.dto.AcademicYearCreateDto;
import ga.gabedt.academic.dto.AcademicYearDto;
import ga.gabedt.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Calendrier de l'établissement courant : années académiques, périodes, jours fériés.
 */
@RestController
@RequestMapping("/api/v1/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AcademicYearDto>>> list() {
        return ResponseEntity.ok(ApiResponse.success(academicYearService.list()));
    }

    /** Année en cours (ou la plus récente) ; data absent si aucune année n'est définie. */
    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AcademicYearDto>> current() {
        return ResponseEntity.ok(ApiResponse.success(academicYearService.current().orElse(null)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AcademicYearDto>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(academicYearService.get(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<AcademicYearDto>> create(@Valid @RequestBody AcademicYearCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Année académique créée", academicYearService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<AcademicYearDto>> update(@PathVariable UUID id, @Valid @RequestBody AcademicYearCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Année académique modifiée", academicYearService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        academicYearService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Année académique supprimée", null));
    }

    /** Pré-remplit les jours fériés du Gabon (dates fixes et fêtes liées à Pâques) pour une année civile. */
    @PostMapping("/public-holidays")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> addPublicHolidays(@RequestParam int year) {
        if (year < 2000 || year > 2100) {
            throw new IllegalArgumentException("Année invalide");
        }
        int added = academicYearService.addPublicHolidays(year);
        return ResponseEntity.ok(ApiResponse.success(added + " jour(s) férié(s) ajouté(s)", added));
    }
}

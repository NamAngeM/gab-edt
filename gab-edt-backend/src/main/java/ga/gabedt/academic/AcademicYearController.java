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

@RestController
@RequestMapping("/api/v1/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<AcademicYearDto>> createAcademicYear(@Valid @RequestBody AcademicYearCreateDto dto) {
        AcademicYearDto response = academicYearService.createAcademicYear(dto);
        return ResponseEntity.ok(ApiResponse.success("Année académique créée", response));
    }

    @GetMapping("/institution/{institutionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AcademicYearDto>>> getAcademicYears(@PathVariable UUID institutionId) {
        List<AcademicYearDto> response = academicYearService.getAcademicYearsByInstitution(institutionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AcademicYearDto>> getAcademicYear(@PathVariable UUID id) {
        AcademicYearDto response = academicYearService.getAcademicYear(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

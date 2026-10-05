package ga.gabedt.timetable.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.timetable.dto.CourseSummaryDto;
import ga.gabedt.timetable.dto.CourseUpsertDto;
import ga.gabedt.timetable.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Répartition des enseignements et suivi du volume horaire.
 */
@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<CourseSummaryDto>>> list(
            @RequestParam(required = false) UUID orgUnitId,
            @RequestParam(required = false) UUID teacherId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(courseService.list(orgUnitId, teacherId, from, to)));
    }

    /** Volume horaire de l'enseignant connecté (prévu, réalisé, à rattraper). */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<CourseSummaryDto>>> mine(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(courseService.mine(from, to)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER') and @securityAclService.canManage(#dto.orgUnitId)")
    public ResponseEntity<ApiResponse<CourseSummaryDto>> create(@Valid @RequestBody CourseUpsertDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Enseignement créé", courseService.create(dto)));
    }

    @PutMapping("/{id}/planned-hours")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER') and @securityAclService.canManage(@courseService.orgUnitOf(#id))")
    public ResponseEntity<ApiResponse<CourseSummaryDto>> updatePlannedHours(
            @PathVariable UUID id, @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(ApiResponse.success(courseService.updatePlannedHours(id, body.get("plannedHours"))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER') and @securityAclService.canManage(@courseService.orgUnitOf(#id))")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        courseService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Enseignement supprimé", null));
    }
}

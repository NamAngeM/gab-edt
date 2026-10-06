package ga.gabedt.user.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.user.dto.TeacherAvailabilityDto;
import ga.gabedt.user.service.TeacherAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teachers/{teacherId}/availabilities")
@RequiredArgsConstructor
public class TeacherAvailabilityController {

    private final TeacherAvailabilityService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<TeacherAvailabilityDto>>> get(@PathVariable UUID teacherId) {
        return ResponseEntity.ok(ApiResponse.success(service.getAvailabilities(teacherId)));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<TeacherAvailabilityDto>>> replace(
            @PathVariable UUID teacherId,
            @RequestBody List<TeacherAvailabilityDto> slots) {
        return ResponseEntity.ok(ApiResponse.success(
                "Disponibilités mises à jour", service.replaceAvailabilities(teacherId, slots)));
    }
}

package ga.gabedt.homework;

import ga.gabedt.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class HomeworkController {

    private final HomeworkService homeworkService;

    @PostMapping("/schedule-events/{eventId}/homework")
    @PreAuthorize("hasAnyRole('TEACHER', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER', 'SUPER_ADMIN') and @securityAclService.canManageEvent(#eventId)")
    public ResponseEntity<ApiResponse<HomeworkDto>> addHomework(
            @PathVariable UUID eventId,
            @RequestBody HomeworkDto dto) {
        return ResponseEntity.ok(ApiResponse.success(homeworkService.addHomework(eventId, dto)));
    }

    @PutMapping("/homework/{id}/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(
            @PathVariable UUID id,
            @RequestBody HomeworkDto dto) {
        homeworkService.toggleStatus(id, dto.isCompleted());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

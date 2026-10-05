package ga.gabedt.attendance;

import ga.gabedt.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/schedule-events/{eventId}/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER', 'SUPER_ADMIN') and @securityAclService.canManageEvent(#eventId)")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendance(@PathVariable UUID eventId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAttendance(eventId)));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER', 'SUPER_ADMIN') and @securityAclService.canManageEvent(#eventId)")
    public ResponseEntity<ApiResponse<Void>> saveAttendance(
            @PathVariable UUID eventId,
            @RequestBody List<AttendanceUpdateDto> updates) {
        attendanceService.saveAttendance(eventId, updates);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/students/{studentId}/print-ticket")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER') and @securityAclService.canManageEvent(#eventId)")
    public ResponseEntity<ApiResponse<Void>> printEntryTicket(@PathVariable UUID eventId, @PathVariable UUID studentId) {
        attendanceService.printEntryTicket(eventId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Billet d'entrée imprimé", null));
    }
}

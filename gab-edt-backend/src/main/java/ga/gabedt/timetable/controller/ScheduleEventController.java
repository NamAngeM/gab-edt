package ga.gabedt.timetable.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.timetable.dto.ScheduleEventCreateDto;
import ga.gabedt.timetable.dto.ScheduleEventDto;
import ga.gabedt.timetable.service.ScheduleEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/schedule-events")
@RequiredArgsConstructor
public class ScheduleEventController {

    private final ScheduleEventService scheduleEventService;
    private final ga.gabedt.timetable.service.ScheduleExportService scheduleExportService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ScheduleEventDto>>> searchEvents(
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) UUID teacherId,
            @RequestParam(required = false) UUID roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<ScheduleEventDto> events = scheduleEventService.searchEvents(groupId, teacherId, roomId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/conflicts")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<ScheduleEventDto>>> getConflicts() {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.getConflicts()));
    }

    @PostMapping
    @PreAuthorize("@securityAclService.canManage(#dto.orgUnitId)")
    public ResponseEntity<ApiResponse<ScheduleEventDto>> createEvent(@Valid @RequestBody ScheduleEventCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.createEvent(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageEvent(#id) and @securityAclService.canManage(#dto.orgUnitId)")
    public ResponseEntity<ApiResponse<ScheduleEventDto>> updateEvent(
            @PathVariable UUID id, 
            @Valid @RequestBody ScheduleEventCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.updateEvent(id, dto)));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("@securityAclService.canManageEvent(#id)")
    public ResponseEntity<ApiResponse<ScheduleEventDto>> rescheduleEvent(
            @PathVariable UUID id, 
            @Valid @RequestBody ga.gabedt.timetable.dto.ScheduleEventRescheduleDto dto) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.rescheduleEvent(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageEvent(#id)")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable UUID id) {
        scheduleEventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/{id}/delay")
    @PreAuthorize("@securityAclService.canManageEvent(#id)")
    public ResponseEntity<ApiResponse<ScheduleEventDto>> reportDelay(
            @PathVariable UUID id, 
            @RequestParam int minutes) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.reportDelay(id, minutes)));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("@securityAclService.canManageEvent(#id)")
    public ResponseEntity<ApiResponse<ScheduleEventDto>> cancelEvent(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.cancelEvent(id)));
    }

    @PutMapping("/bulk-cancel")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER') and @securityAclService.canManage(#orgUnitId)")
    public ResponseEntity<ApiResponse<String>> bulkCancelEvents(
            @RequestParam UUID orgUnitId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String reason) {
        
        int count = scheduleEventService.cancelEventsByDate(orgUnitId, date, reason);
        return ResponseEntity.ok(ApiResponse.success(count + " cours annulés avec succès.", null));
    }

    /** Séances annulées à rattraper (grèves, absences, coupures…). */
    @GetMapping("/to-make-up")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<ScheduleEventDto>>> getEventsToMakeUp(
            @RequestParam(required = false) UUID orgUnitId,
            @RequestParam(required = false) UUID teacherId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.getEventsToMakeUp(orgUnitId, teacherId)));
    }

    @PutMapping("/publish")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER') and @securityAclService.canManage(#orgUnitId)")
    public ResponseEntity<ApiResponse<Integer>> publishEvents(
            @RequestParam UUID orgUnitId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        int count = scheduleEventService.publishEvents(orgUnitId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(count + " cours publiés", count));
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) UUID teacherId,
            @RequestParam(required = false) UUID roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        byte[] pdfBytes = scheduleExportService.exportToPdf(groupId, teacherId, roomId, startDate, endDate);
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "emploi_du_temps.pdf");
        
        return new ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/export/excel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) UUID teacherId,
            @RequestParam(required = false) UUID roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        byte[] excelBytes = scheduleExportService.exportToExcel(groupId, teacherId, roomId, startDate, endDate);
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "emploi_du_temps.xlsx");
        
        return new ResponseEntity<>(excelBytes, headers, org.springframework.http.HttpStatus.OK);
    }
}

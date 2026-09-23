package ga.gabedt.timetable.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.timetable.dto.ScheduleEventCreateDto;
import ga.gabedt.timetable.dto.ScheduleEventDto;
import ga.gabedt.timetable.service.ScheduleEventService;
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

    @GetMapping
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
    public ResponseEntity<ApiResponse<List<ScheduleEventDto>>> getConflicts() {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.getConflicts()));
    }

    @PostMapping
    @PreAuthorize("@securityAclService.canManage(#dto.orgUnitId)")
    public ResponseEntity<ApiResponse<ScheduleEventDto>> createEvent(@RequestBody ScheduleEventCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.createEvent(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityAclService.canManage(#dto.orgUnitId)")
    public ResponseEntity<ApiResponse<ScheduleEventDto>> updateEvent(
            @PathVariable UUID id, 
            @RequestBody ScheduleEventCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.updateEvent(id, dto)));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("@securityAclService.canManageEvent(#id)")
    public ResponseEntity<ApiResponse<ScheduleEventDto>> rescheduleEvent(
            @PathVariable UUID id, 
            @RequestBody ga.gabedt.timetable.dto.ScheduleEventRescheduleDto dto) {
        return ResponseEntity.ok(ApiResponse.success(scheduleEventService.rescheduleEvent(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageEvent(#id)")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable UUID id) {
        scheduleEventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

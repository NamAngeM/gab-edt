package ga.gabedt.resource.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.resource.dto.RoomAdminDto;
import ga.gabedt.resource.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ga.gabedt.user.dto.BulkStatusDto;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RoomAdminDto>>> findAll(
            @RequestParam(required = false) UUID orgUnitId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.findAll(orgUnitId, search, active, pageable)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<RoomAdminDto>>> findAvailable(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime start,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(service.findAvailableRooms(start, end)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomAdminDto>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("@securityAclService.canManage(#dto.orgUnitId)")
    public ResponseEntity<ApiResponse<RoomAdminDto>> create(@RequestBody RoomAdminDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageRoom(#id) and @securityAclService.canManage(#dto.orgUnitId)")
    public ResponseEntity<ApiResponse<RoomAdminDto>> update(@PathVariable UUID id, @RequestBody RoomAdminDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageRoom(#id)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/bulk-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkDelete(@RequestBody List<UUID> ids) {
        service.bulkDelete(ids);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/bulk-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkUpdateStatus(@RequestBody BulkStatusDto dto) {
        service.bulkUpdateStatus(dto.getIds(), dto.isActive());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping(value = "/import-csv", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> importCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(service.importCsv(file)));
    }
}

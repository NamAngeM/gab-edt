package ga.gabedt.user.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.user.dto.StudentAdminDto;
import ga.gabedt.user.service.StudentService;
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
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER', 'TEACHER')")
    public ResponseEntity<ApiResponse<Page<StudentAdminDto>>> findAll(
            @RequestParam(required = false) UUID orgUnitId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.findAll(orgUnitId, search, active, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityAclService.canViewStudent(#id)")
    public ResponseEntity<ApiResponse<StudentAdminDto>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("@securityAclService.canManageAny(#dto.orgUnitIds)")
    public ResponseEntity<ApiResponse<StudentAdminDto>> create(@RequestBody StudentAdminDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageStudent(#id) and @securityAclService.canManageAny(#dto.orgUnitIds)")
    public ResponseEntity<ApiResponse<StudentAdminDto>> update(@PathVariable UUID id, @RequestBody StudentAdminDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageStudent(#id)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/bulk-delete")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkDelete(@RequestBody List<UUID> ids) {
        service.bulkDelete(ids);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/bulk-status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkUpdateStatus(@RequestBody BulkStatusDto dto) {
        service.bulkUpdateStatus(dto.getIds(), dto.isActive());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping(value = "/import-csv", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> importCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(service.importCsv(file)));
    }
}

package ga.gabedt.resource.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.dto.SubjectCreateDto;
import ga.gabedt.resource.dto.SubjectUpdateDto;
import ga.gabedt.resource.dto.SubjectDto;
import ga.gabedt.resource.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getAllSubjects()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SubjectDto>> create(@Valid @RequestBody SubjectCreateDto dto) {
        SubjectDto created = subjectService.createSubject(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SubjectDto>> update(@PathVariable UUID id, @Valid @RequestBody SubjectUpdateDto dto) {
        SubjectDto updated = subjectService.updateSubject(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping(value = "/import-csv", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> importCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.importCsv(file)));
    }
}

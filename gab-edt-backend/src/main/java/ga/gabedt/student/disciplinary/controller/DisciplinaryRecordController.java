package ga.gabedt.student.disciplinary.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.student.disciplinary.DisciplinaryRecordService;
import ga.gabedt.student.disciplinary.dto.DisciplinaryRecordCreateDto;
import ga.gabedt.student.disciplinary.dto.DisciplinaryRecordDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/disciplinary-records")
@RequiredArgsConstructor
public class DisciplinaryRecordController {

    private final DisciplinaryRecordService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER', 'TEACHER')")
    public ResponseEntity<ApiResponse<DisciplinaryRecordDto>> createRecord(@Valid @RequestBody DisciplinaryRecordCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Enregistrement disciplinaire créé", service.createRecord(dto)));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("@securityAclService.canViewStudent(#studentId)")
    public ResponseEntity<ApiResponse<List<DisciplinaryRecordDto>>> getStudentRecords(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.success(service.getStudentRecords(studentId)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<DisciplinaryRecordDto>>> getAllRecords() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllRecords()));
    }

    @PostMapping("/{id}/sign")
    @PreAuthorize("@securityAclService.canSignDisciplinaryRecord(#id)")
    public ResponseEntity<ApiResponse<DisciplinaryRecordDto>> signRecord(@PathVariable UUID id, @RequestParam String signatureCode) {
        return ResponseEntity.ok(ApiResponse.success("Carnet signé numériquement", service.signRecord(id, signatureCode)));
    }
}

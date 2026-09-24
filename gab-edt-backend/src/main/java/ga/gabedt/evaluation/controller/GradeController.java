package ga.gabedt.evaluation.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.evaluation.dto.BulkGradeDto;
import ga.gabedt.evaluation.service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ga.gabedt.evaluation.dto.GradeDto;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('TEACHER') or hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> submitBulkGrades(@RequestBody BulkGradeDto dto) {
        gradeService.submitBulkGrades(dto);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<ApiResponse<List<GradeDto>>> getMyGrades(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(gradeService.getStudentGrades(UUID.fromString(principal.getName()))));
    }
}

package ga.gabedt.evaluation.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.evaluation.dto.BulkGradeDto;
import ga.gabedt.evaluation.service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<Void>> submitBulkGrades(@RequestBody BulkGradeDto dto) {
        gradeService.submitBulkGrades(dto);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

package ga.gabedt.exam.controller;

import ga.gabedt.exam.dto.*;
import ga.gabedt.exam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @GetMapping("/sessions")
    public ResponseEntity<List<ExamSessionDto>> getAllSessions() {
        return ResponseEntity.ok(examService.getAllSessions());
    }

    @PostMapping("/sessions")
    public ResponseEntity<ExamSessionDto> createSession(@RequestBody ExamSessionCreateDto dto) {
        return ResponseEntity.ok(examService.createSession(dto));
    }

    @GetMapping("/sessions/{sessionId}/exams")
    public ResponseEntity<List<ExamDto>> getExamsForSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(examService.getExamsForSession(sessionId));
    }

    @PostMapping
    public ResponseEntity<ExamDto> createExam(@RequestBody ExamCreateDto dto) {
        return ResponseEntity.ok(examService.createExam(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable UUID id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }
}

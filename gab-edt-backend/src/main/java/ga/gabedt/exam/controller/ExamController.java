package ga.gabedt.exam.controller;

import ga.gabedt.exam.dto.*;
import ga.gabedt.exam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExamSessionDto>> getAllSessions() {
        return ResponseEntity.ok(examService.getAllSessions());
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ExamSessionDto> createSession(@Valid @RequestBody ExamSessionCreateDto dto) {
        return ResponseEntity.ok(examService.createSession(dto));
    }

    @GetMapping("/sessions/{sessionId}/exams")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExamDto>> getExamsForSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(examService.getExamsForSession(sessionId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ExamDto> createExam(@Valid @RequestBody ExamCreateDto dto) {
        return ResponseEntity.ok(examService.createExam(dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<Void> deleteExam(@PathVariable UUID id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }
}

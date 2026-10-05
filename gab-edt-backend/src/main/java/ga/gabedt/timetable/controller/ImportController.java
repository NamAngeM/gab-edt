package ga.gabedt.timetable.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.timetable.dto.ScheduleEventCreateDto;
import ga.gabedt.timetable.service.ScheduleImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
public class ImportController {

    private final ScheduleImportService scheduleImportService;

    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<ScheduleEventCreateDto>>> previewImport(@RequestParam("file") MultipartFile file) {
        if (!file.getOriginalFilename().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Veuillez fournir un fichier Excel (.xlsx)"));
        }
        List<ScheduleEventCreateDto> preview = scheduleImportService.parseExcelFile(file);
        return ResponseEntity.ok(ApiResponse.success("Aperçu généré avec succès", preview));
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> confirmImport(@RequestBody List<ScheduleEventCreateDto> dtos) {
        scheduleImportService.importEvents(dtos);
        return ResponseEntity.ok(ApiResponse.success("Importation terminée avec succès", null));
    }
}

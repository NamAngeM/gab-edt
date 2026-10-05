package ga.gabedt.timetable.service;

import ga.gabedt.timetable.dto.ScheduleEventCreateDto;
import ga.gabedt.timetable.enums.EventStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleImportService {

    private final ScheduleEventService scheduleEventService;
    private final ga.gabedt.auth.SecurityAclService securityAclService;
    
    // In a real application, you would map these names to actual UUIDs using Repositories
    // private final SubjectRepository subjectRepository;
    // private final TeacherRepository teacherRepository;
    // private final RoomRepository roomRepository;
    
    /**
     * Import schedule events from an Excel file.
     * Expected format:
     * Col 0: Subject ID
     * Col 1: Teacher ID
     * Col 2: Room ID
     * Col 3: OrgUnit ID
     * Col 4: Start Date (yyyy-MM-dd HH:mm)
     * Col 5: End Date (yyyy-MM-dd HH:mm)
     * Col 6: Notes
     */
    public List<ScheduleEventCreateDto> parseExcelFile(MultipartFile file) {
        List<ScheduleEventCreateDto> eventsToCreate = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Skip header (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    ScheduleEventCreateDto dto = new ScheduleEventCreateDto();
                    dto.setSubjectId(UUID.fromString(getCellValue(row.getCell(0))));
                    dto.setTeacherId(UUID.fromString(getCellValue(row.getCell(1))));
                    
                    String roomIdStr = getCellValue(row.getCell(2));
                    if (roomIdStr != null && !roomIdStr.isBlank()) {
                        dto.setRoomId(UUID.fromString(roomIdStr));
                    }
                    
                    dto.setOrgUnitId(UUID.fromString(getCellValue(row.getCell(3))));
                    dto.setStartAt(LocalDateTime.parse(getCellValue(row.getCell(4)), formatter));
                    dto.setEndAt(LocalDateTime.parse(getCellValue(row.getCell(5)), formatter));
                    dto.setStatus(EventStatus.SCHEDULED);
                    dto.setNotes(getCellValue(row.getCell(6)));
                    
                    eventsToCreate.add(dto);
                } catch (Exception e) {
                    log.error("Error parsing row {}: {}", i, e.getMessage());
                    throw new IllegalArgumentException("Erreur à la ligne " + (i + 1) + " : " + e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Excel file", e);
            throw new IllegalArgumentException("Impossible de lire le fichier Excel: " + e.getMessage());
        }
        
        return eventsToCreate;
    }
    
    @org.springframework.transaction.annotation.Transactional
    public void importEvents(List<ScheduleEventCreateDto> dtos) {
        // Toutes les lignes sont vérifiées avant la moindre écriture : un responsable
        // pédagogique ne peut pas importer de cours hors de son périmètre.
        for (ScheduleEventCreateDto dto : dtos) {
            if (!securityAclService.canManage(dto.getOrgUnitId())) {
                throw new ga.gabedt.common.exception.UnauthorizedAccessException(
                        "Import refusé : unité organisationnelle hors de votre périmètre");
            }
        }
        for (ScheduleEventCreateDto dto : dtos) {
            scheduleEventService.createEvent(dto);
        }
    }
    
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                }
                yield String.valueOf(cell.getNumericCellValue());
            }
            default -> "";
        };
    }
}

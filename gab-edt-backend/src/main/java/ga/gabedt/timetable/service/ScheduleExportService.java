package ga.gabedt.timetable.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import ga.gabedt.timetable.dto.ScheduleEventDto;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScheduleExportService {

    private final ScheduleEventService scheduleEventService;
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] exportToPdf(UUID groupId, UUID teacherId, UUID roomId, LocalDate startDate, LocalDate endDate) {
        List<ScheduleEventDto> events = scheduleEventService.searchEvents(groupId, teacherId, roomId, startDate, endDate);
        
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Emploi du temps", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 1f, 1f, 2f, 2f, 1.5f});

            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);

            String[] headers = {"Date", "Début", "Fin", "Matière", "Professeur", "Salle"};
            for (String header : headers) {
                PdfPCell hcell = new PdfPCell(new Phrase(header, headFont));
                hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
                hcell.setPadding(5);
                table.addCell(hcell);
            }

            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

            for (ScheduleEventDto event : events) {
                PdfPCell dateCell = new PdfPCell(new Phrase(event.getStartAt().format(dateFormatter), cellFont));
                dateCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(dateCell);

                PdfPCell startCell = new PdfPCell(new Phrase(event.getStartAt().format(timeFormatter), cellFont));
                startCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(startCell);

                PdfPCell endCell = new PdfPCell(new Phrase(event.getEndAt().format(timeFormatter), cellFont));
                endCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(endCell);

                String subjectName = event.getSubject() != null && event.getSubject().getName() != null ? event.getSubject().getName() : "-";
                PdfPCell subjectCell = new PdfPCell(new Phrase(subjectName, cellFont));
                table.addCell(subjectCell);

                String teacherName = "-";
                if (event.getTeacher() != null) {
                    teacherName = (event.getTeacher().getFirstName() != null ? event.getTeacher().getFirstName() + " " : "") +
                                  (event.getTeacher().getLastName() != null ? event.getTeacher().getLastName() : "");
                }
                PdfPCell teacherCell = new PdfPCell(new Phrase(teacherName, cellFont));
                table.addCell(teacherCell);

                String roomName = event.getRoom() != null && event.getRoom().getName() != null ? event.getRoom().getName() : "-";
                PdfPCell roomCell = new PdfPCell(new Phrase(roomName, cellFont));
                table.addCell(roomCell);
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'export PDF", e);
        }
    }

    public byte[] exportToExcel(UUID groupId, UUID teacherId, UUID roomId, LocalDate startDate, LocalDate endDate) {
        List<ScheduleEventDto> events = scheduleEventService.searchEvents(groupId, teacherId, roomId, startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Emploi du temps");

            // Header styling
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Header row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] columns = {"Date", "Heure de début", "Heure de fin", "Matière", "Professeur", "Salle", "Groupe"};
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Data styling
            CellStyle dateCellStyle = workbook.createCellStyle();
            CreationHelper createHelper = workbook.getCreationHelper();
            dateCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy"));

            CellStyle timeCellStyle = workbook.createCellStyle();
            timeCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("HH:mm"));

            int rowIdx = 1;
            for (ScheduleEventDto event : events) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);

                org.apache.poi.ss.usermodel.Cell cell0 = row.createCell(0);
                cell0.setCellValue(event.getStartAt());
                cell0.setCellStyle(dateCellStyle);

                org.apache.poi.ss.usermodel.Cell cell1 = row.createCell(1);
                cell1.setCellValue(event.getStartAt());
                cell1.setCellStyle(timeCellStyle);

                org.apache.poi.ss.usermodel.Cell cell2 = row.createCell(2);
                cell2.setCellValue(event.getEndAt());
                cell2.setCellStyle(timeCellStyle);

                row.createCell(3).setCellValue(event.getSubject() != null && event.getSubject().getName() != null ? event.getSubject().getName() : "-");
                
                String teacherName = "-";
                if (event.getTeacher() != null) {
                    teacherName = (event.getTeacher().getFirstName() != null ? event.getTeacher().getFirstName() + " " : "") +
                                  (event.getTeacher().getLastName() != null ? event.getTeacher().getLastName() : "");
                }
                row.createCell(4).setCellValue(teacherName);

                row.createCell(5).setCellValue(event.getRoom() != null && event.getRoom().getName() != null ? event.getRoom().getName() : "-");
                row.createCell(6).setCellValue(event.getGroup() != null && event.getGroup().getName() != null ? event.getGroup().getName() : "-");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'export Excel", e);
        }
    }
}

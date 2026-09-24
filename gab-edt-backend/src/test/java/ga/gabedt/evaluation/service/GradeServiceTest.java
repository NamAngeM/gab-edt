package ga.gabedt.evaluation.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.evaluation.Grade;
import ga.gabedt.evaluation.dto.BulkGradeDto;
import ga.gabedt.evaluation.repository.GradeRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GradeServiceTest {

    @Mock
    private GradeRepository gradeRepository;
    
    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private GradeService gradeService;

    @Captor
    private ArgumentCaptor<List<Grade>> gradesCaptor;

    private UUID student1Id;
    private UUID student2Id;
    private Student student1;
    private Student student2;

    @BeforeEach
    void setUp() {
        student1Id = UUID.randomUUID();
        student2Id = UUID.randomUUID();
        
        student1 = new Student();
        student1.setId(student1Id);
        student1.setTenantId(UUID.randomUUID());

        student2 = new Student();
        student2.setId(student2Id);
        student2.setTenantId(UUID.randomUUID());
    }

    @Test
    void submitBulkGrades_shouldSaveValidGrades() {
        // Arrange
        when(studentRepository.findById(student1Id)).thenReturn(Optional.of(student1));
        when(studentRepository.findById(student2Id)).thenReturn(Optional.of(student2));

        BulkGradeDto dto = new BulkGradeDto();
        dto.setTitle("Contrôle Continu");
        dto.setCoefficient(2.0);

        BulkGradeDto.GradeEntry entry1 = new BulkGradeDto.GradeEntry();
        entry1.setStudentId(student1Id.toString());
        entry1.setValue(15.5);

        BulkGradeDto.GradeEntry entry2 = new BulkGradeDto.GradeEntry();
        entry2.setStudentId(student2Id.toString());
        entry2.setValue(12.0);

        dto.setGrades(List.of(entry1, entry2));

        // Act
        gradeService.submitBulkGrades(dto);

        // Assert
        verify(gradeRepository, times(1)).saveAll(gradesCaptor.capture());
        List<Grade> savedGrades = gradesCaptor.getValue();
        
        assertEquals(2, savedGrades.size());
        
        assertEquals("Contrôle Continu", savedGrades.get(0).getTitle());
        assertEquals(2.0, savedGrades.get(0).getCoefficient());
        assertEquals(15.5, savedGrades.get(0).getValue());
        assertEquals(student1Id, savedGrades.get(0).getStudent().getId());
        assertEquals(student1.getTenantId(), savedGrades.get(0).getTenantId());
        
        assertEquals(12.0, savedGrades.get(1).getValue());
    }

    @Test
    void submitBulkGrades_shouldIgnoreEntriesWithNullValue() {
        // Arrange
        when(studentRepository.findById(student1Id)).thenReturn(Optional.of(student1));

        BulkGradeDto dto = new BulkGradeDto();
        dto.setTitle("Devoir");
        dto.setCoefficient(1.0);

        BulkGradeDto.GradeEntry entry1 = new BulkGradeDto.GradeEntry();
        entry1.setStudentId(student1Id.toString());
        entry1.setValue(14.0);

        BulkGradeDto.GradeEntry entryNull = new BulkGradeDto.GradeEntry();
        entryNull.setStudentId(student2Id.toString());
        entryNull.setValue(null); // Should be ignored without looking up student

        dto.setGrades(List.of(entry1, entryNull));

        // Act
        gradeService.submitBulkGrades(dto);

        // Assert
        verify(studentRepository, never()).findById(student2Id);
        verify(gradeRepository, times(1)).saveAll(gradesCaptor.capture());
        
        List<Grade> savedGrades = gradesCaptor.getValue();
        assertEquals(1, savedGrades.size());
        assertEquals(14.0, savedGrades.get(0).getValue());
    }

    @Test
    void submitBulkGrades_shouldThrowException_whenStudentNotFound() {
        // Arrange
        when(studentRepository.findById(student1Id)).thenReturn(Optional.empty());

        BulkGradeDto dto = new BulkGradeDto();
        
        BulkGradeDto.GradeEntry entry1 = new BulkGradeDto.GradeEntry();
        entry1.setStudentId(student1Id.toString());
        entry1.setValue(10.0);

        dto.setGrades(List.of(entry1));

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> gradeService.submitBulkGrades(dto));
        verify(gradeRepository, never()).saveAll(anyList());
    }
}

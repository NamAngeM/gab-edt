package ga.gabedt.resource.service;

import ga.gabedt.common.exception.BusinessConflictException;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.dto.SubjectCreateDto;
import ga.gabedt.resource.dto.SubjectDto;
import ga.gabedt.resource.dto.SubjectUpdateDto;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubjectServiceTest {

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private OrganizationalUnitRepository orgUnitRepository;

    @Mock
    private ga.gabedt.tenant.CurrentTenant currentTenant;

    @InjectMocks
    private SubjectService subjectService;

    private Subject subject;
    private Institution institution;

    @BeforeEach
    void setUp() {
        subject = new Subject();
        subject.setId(UUID.randomUUID());
        subject.setName("Maths");
        subject.setCode("MATH-101");

        institution = new Institution();
        institution.setId(UUID.randomUUID());
    }

    @Test
    void getAllSubjects_ShouldReturnMappedSubjects() {
        when(subjectRepository.findAllByDeletedFalse()).thenReturn(List.of(subject));

        List<SubjectDto> result = subjectService.getAllSubjects();

        assertEquals(1, result.size());
        assertEquals("Maths", result.get(0).getName());
    }

    @Test
    void createSubject_ShouldSaveAndReturnSubject() {
        SubjectCreateDto dto = new SubjectCreateDto();
        dto.setName("Physics");
        dto.setCode("PHYS-101");

        when(subjectRepository.findByCodeAndDeletedFalse(dto.getCode())).thenReturn(Optional.empty());
        when(currentTenant.requireInstitution()).thenReturn(institution);
        when(subjectRepository.save(any(Subject.class))).thenAnswer(i -> i.getArguments()[0]);

        SubjectDto result = subjectService.createSubject(dto);

        assertNotNull(result);
        assertEquals("Physics", result.getName());
        assertEquals("PHYS-101", result.getCode());
        verify(subjectRepository, times(1)).save(any(Subject.class));
    }

    @Test
    void createSubject_ShouldThrowException_WhenCodeExists() {
        SubjectCreateDto dto = new SubjectCreateDto();
        dto.setCode("MATH-101");

        when(subjectRepository.findByCodeAndDeletedFalse(dto.getCode())).thenReturn(Optional.of(subject));

        assertThrows(BusinessConflictException.class, () -> subjectService.createSubject(dto));
        verify(subjectRepository, never()).save(any(Subject.class));
    }

    @Test
    void updateSubject_ShouldUpdateAndReturnSubject() {
        SubjectUpdateDto dto = new SubjectUpdateDto();
        dto.setName("Advanced Maths");
        dto.setCode("MATH-201");

        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(subjectRepository.findByCodeAndDeletedFalse(dto.getCode())).thenReturn(Optional.empty());
        when(subjectRepository.save(any(Subject.class))).thenAnswer(i -> i.getArguments()[0]);

        SubjectDto result = subjectService.updateSubject(subject.getId(), dto);

        assertEquals("Advanced Maths", result.getName());
        assertEquals("MATH-201", result.getCode());
    }

    @Test
    void updateSubject_ShouldThrowException_WhenCodeExistsForAnotherSubject() {
        SubjectUpdateDto dto = new SubjectUpdateDto();
        dto.setCode("PHYS-101"); // Another subject's code

        Subject existingSubject = new Subject();
        existingSubject.setId(UUID.randomUUID());
        
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(subjectRepository.findByCodeAndDeletedFalse(dto.getCode())).thenReturn(Optional.of(existingSubject));

        assertThrows(BusinessConflictException.class, () -> subjectService.updateSubject(subject.getId(), dto));
    }

    @Test
    void deleteSubject_ShouldMarkAsDeleted() {
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));

        subjectService.deleteSubject(subject.getId());

        assertTrue(subject.isDeleted());
        verify(subjectRepository, times(1)).save(subject);
    }
}

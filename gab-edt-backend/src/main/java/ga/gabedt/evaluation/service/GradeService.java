package ga.gabedt.evaluation.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.evaluation.Grade;
import ga.gabedt.evaluation.dto.BulkGradeDto;
import ga.gabedt.evaluation.repository.GradeRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.evaluation.dto.GradeDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class GradeService {

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public void submitBulkGrades(BulkGradeDto dto) {
        List<Grade> gradesToSave = new ArrayList<>();
        Subject subject = null;
        if (dto.getSubjectId() != null && !dto.getSubjectId().isEmpty()) {
            subject = subjectRepository.findById(UUID.fromString(dto.getSubjectId())).orElse(null);
        }

        for (BulkGradeDto.GradeEntry entry : dto.getGrades()) {
            if (entry.getValue() != null) {
                Student student = studentRepository.findById(UUID.fromString(entry.getStudentId()))
                        .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

                Grade grade = new Grade();
                grade.setTitle(dto.getTitle());
                grade.setCoefficient(dto.getCoefficient());
                grade.setValue(entry.getValue());
                grade.setStudent(student);
                grade.setSubject(subject);
                grade.setTenantId(student.getTenantId()); // Inherit tenant from student

                gradesToSave.add(grade);
            }
        }

        gradeRepository.saveAll(gradesToSave);
    }

    public List<GradeDto> getStudentGrades(UUID studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        List<GradeDto> dtos = new ArrayList<>();
        for(Grade g : grades) {
            GradeDto d = new GradeDto();
            d.setId(g.getId());
            d.setTitle(g.getTitle());
            d.setValue(g.getValue());
            d.setCoefficient(g.getCoefficient());
            if(g.getSubject() != null) {
                d.setSubjectId(g.getSubject().getId());
                d.setSubjectName(g.getSubject().getName());
            }
            dtos.add(d);
        }
        return dtos;
    }
}

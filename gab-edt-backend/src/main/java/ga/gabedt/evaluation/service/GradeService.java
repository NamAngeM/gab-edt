package ga.gabedt.evaluation.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.evaluation.Grade;
import ga.gabedt.evaluation.dto.BulkGradeDto;
import ga.gabedt.evaluation.repository.GradeRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
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

    public void submitBulkGrades(BulkGradeDto dto) {
        List<Grade> gradesToSave = new ArrayList<>();

        for (BulkGradeDto.GradeEntry entry : dto.getGrades()) {
            if (entry.getValue() != null) {
                Student student = studentRepository.findById(UUID.fromString(entry.getStudentId()))
                        .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

                Grade grade = new Grade();
                grade.setTitle(dto.getTitle());
                grade.setCoefficient(dto.getCoefficient());
                grade.setValue(entry.getValue());
                grade.setStudent(student);
                grade.setTenantId(student.getTenantId()); // Inherit tenant from student

                gradesToSave.add(grade);
            }
        }

        gradeRepository.saveAll(gradesToSave);
    }
}

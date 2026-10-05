package ga.gabedt.evaluation;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.user.Student;
import ga.gabedt.resource.Subject;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "grades")
@Getter
@Setter
@NoArgsConstructor
public class Grade extends TenantAwareEntity {

    @Column(nullable = false)
    private String title;

    // « value » est un mot réservé (H2) : colonne renommée
    @Column(name = "grade_value", nullable = false)
    private Double value;

    @Column(nullable = false)
    private Double coefficient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;
}

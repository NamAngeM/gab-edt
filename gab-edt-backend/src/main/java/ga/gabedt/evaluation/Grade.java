package ga.gabedt.evaluation;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.user.Student;
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

    @Column(nullable = false)
    private Double value;

    @Column(nullable = false)
    private Double coefficient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
}

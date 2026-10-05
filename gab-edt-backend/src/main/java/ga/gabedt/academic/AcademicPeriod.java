package ga.gabedt.academic;

import ga.gabedt.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Période académique (semestre, trimestre, etc.) au sein d'une année académique.
 * <p>
 * Cahier des charges §42 : SEMESTER, TRIMESTER, TERM.
 */
@Entity
@Table(name = "academic_periods")
@Getter
@Setter
@NoArgsConstructor
public class AcademicPeriod extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(nullable = false)
    private String name; // ex: "Semestre 1", "Trimestre 2"

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", nullable = false)
    private PeriodType periodType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "order_index")
    private Integer orderIndex;
}

package ga.gabedt.academic;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.structure.Institution;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Année académique — ex: 2026-2027.
 * <p>
 * Cahier des charges §41 : une année académique possède une date de début, de fin
 * et contient des périodes (semestres, trimestres).
 */
@Entity
@Table(name = "academic_years")
@Getter
@Setter
@NoArgsConstructor
public class AcademicYear extends TenantAwareEntity {

    @Column(nullable = false)
    private String name; // ex: "2026-2027"

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AcademicYearStatus status = AcademicYearStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @OneToMany(mappedBy = "academicYear", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AcademicPeriod> periods = new ArrayList<>();
}

package ga.gabedt.exam;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.structure.OrganizationalUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "exam_sessions")
@Getter
@Setter
@NoArgsConstructor
public class ExamSession extends TenantAwareEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_unit_id", nullable = false)
    private OrganizationalUnit orgUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private ga.gabedt.structure.Institution institution;

    @Column(name = "is_published", nullable = false)
    private boolean published = false;
}

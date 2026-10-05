package ga.gabedt.timetable;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.resource.Subject;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.user.Teacher;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
public class Course extends TenantAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_unit_id", nullable = false)
    private OrganizationalUnit orgUnit;

    /**
     * Volume horaire prévu pour cet enseignement (heures sur l'année ou la période),
     * base du suivi prévu / réalisé / à rattraper. Null si non renseigné.
     */
    @Column(name = "planned_hours")
    private Double plannedHours;
}

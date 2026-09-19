package ga.gabedt.user;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
public class Teacher extends TenantAwareEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "employee_number")
    private String employeeNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "teacher_org_units",
        joinColumns = @JoinColumn(name = "teacher_id"),
        inverseJoinColumns = @JoinColumn(name = "org_unit_id")
    )
    private java.util.Set<OrganizationalUnit> orgUnits = new java.util.HashSet<>();
}

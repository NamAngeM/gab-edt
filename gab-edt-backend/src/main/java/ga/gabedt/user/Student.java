package ga.gabedt.user;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students", uniqueConstraints = @UniqueConstraint(name = "uk_students_tenant_number", columnNames = {"tenant_id", "student_number"}))
@Getter
@Setter
@NoArgsConstructor
public class Student extends TenantAwareEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "student_number")
    private String studentNumber;

    @Column(name = "parent_password_hash")
    private String parentPasswordHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "student_org_units",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "org_unit_id")
    )
    private java.util.Set<OrganizationalUnit> orgUnits = new java.util.HashSet<>();
}

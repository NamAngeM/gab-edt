package ga.gabedt.resource;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
public class Subject extends TenantAwareEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_unit_id")
    private OrganizationalUnit orgUnit;
}

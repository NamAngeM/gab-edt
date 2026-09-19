package ga.gabedt.resource;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
public class Room extends TenantAwareEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String code;

    private Integer capacity;

    private String type;
    
    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_unit_id")
    private OrganizationalUnit orgUnit;
}

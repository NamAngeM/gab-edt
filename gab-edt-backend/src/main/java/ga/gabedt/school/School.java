package ga.gabedt.school;

import ga.gabedt.common.entity.BaseEntity;
import ga.gabedt.common.enums.SchoolType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "schools")
@Getter
@Setter
@NoArgsConstructor
public class School extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SchoolType type;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(nullable = false)
    private String timezone = "Africa/Libreville";

    @Column(name = "country_code", nullable = false)
    private String countryCode = "GA";

    @Column(nullable = false)
    private boolean active = true;
}

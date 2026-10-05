package ga.gabedt.student.disciplinary;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.user.Student;
import ga.gabedt.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Carnet de correspondance numérique : Trace les incidents, retards, avertissements.
 */
@Entity
@Table(name = "disciplinary_records")
@Getter
@Setter
@NoArgsConstructor
public class DisciplinaryRecord extends TenantAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy; // Censeur, Surveillant, Prof

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisciplinaryType type; // AVERTISSEMENT, BLAME, EXCLUSION_TEMPORAIRE, RETARD, CONVOCATION_PARENT

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "incident_date", nullable = false)
    private LocalDateTime incidentDate;

    // Pour la validation par le parent (Signature numérique / SMS)
    @Column(name = "parent_signature")
    private String parentSignature; // Hash ou code SMS

    @Column(name = "signed_at")
    private LocalDateTime signedAt;
}

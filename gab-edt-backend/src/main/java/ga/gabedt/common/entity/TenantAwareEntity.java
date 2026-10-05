package ga.gabedt.common.entity;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.tenant.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PostLoad;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.TenantId;

import java.util.UUID;

/**
 * Extension de {@link BaseEntity} pour les entités multi-tenant.
 * <p>
 * Toutes les entités métier rattachées à un établissement doivent
 * étendre cette classe pour garantir l'isolation des données.
 * Le filtrage des requêtes est assuré par Hibernate ({@link TenantId}) ;
 * le contrôle {@link #verifyTenant()} couvre en plus les chargements par identifiant
 * ({@code findById}), que Hibernate ne filtre pas.
 */
@Getter
@Setter
@MappedSuperclass
public abstract class TenantAwareEntity extends BaseEntity {

    @TenantId
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @PostLoad
    protected void verifyTenant() {
        UUID current = TenantContext.getTenantId();
        if (current != null && tenantId != null && !current.equals(tenantId)) {
            throw new ResourceNotFoundException(getClass().getSimpleName() + " introuvable");
        }
    }
}

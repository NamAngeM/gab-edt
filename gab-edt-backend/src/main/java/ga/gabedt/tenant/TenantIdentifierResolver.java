package ga.gabedt.tenant;

import org.hibernate.cfg.AvailableSettings;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * Fournit à Hibernate l'établissement courant pour le filtrage {@code @TenantId}.
 * <p>
 * Toute session Hibernate ouverte pendant une requête authentifiée est automatiquement
 * restreinte aux lignes de l'établissement de l'utilisateur. En l'absence de contexte
 * (tâches système, seeder, SUPER_ADMIN sans établissement ciblé), le tenant « racine »
 * est utilisé : pas de filtre, et la valeur de {@code tenant_id} doit être assignée explicitement.
 */
@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<UUID>, HibernatePropertiesCustomizer {

    public static final UUID ROOT_TENANT = new UUID(0L, 0L);

    @Override
    public UUID resolveCurrentTenantIdentifier() {
        UUID tenantId = TenantContext.getTenantId();
        return tenantId != null ? tenantId : ROOT_TENANT;
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return false;
    }

    @Override
    public boolean isRoot(UUID tenantId) {
        return ROOT_TENANT.equals(tenantId);
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, this);
    }
}

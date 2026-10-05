package ga.gabedt.tenant;

import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Accès à l'utilisateur et à l'établissement de la requête en cours.
 * Remplace les anciens « premier établissement trouvé » : toute création de données
 * est rattachée à l'établissement de l'utilisateur authentifié.
 */
@Component
@RequiredArgsConstructor
public class CurrentTenant {

    private final InstitutionRepository institutionRepository;

    public UUID requireTenantId() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new UnauthorizedAccessException("Aucun établissement associé à la requête");
        }
        return tenantId;
    }

    public Institution requireInstitution() {
        UUID tenantId = requireTenantId();
        return institutionRepository.findById(tenantId)
                .orElseThrow(() -> new UnauthorizedAccessException("Établissement introuvable"));
    }

    public User requireUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        throw new UnauthorizedAccessException("Utilisateur non authentifié");
    }
}

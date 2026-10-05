package ga.gabedt.audit;

import ga.gabedt.audit.dto.AuditLogDto;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

/**
 * Service pour enregistrer et consulter les journaux d'audit.
 * <p>
 * Cahier des charges §33 : toutes les actions importantes doivent être journalisées.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Log an audit event. Called by services after sensitive operations.
     */
    @Transactional
    public void logAction(String action, String entityType, UUID entityId,
                          String oldValues, String newValues, String description) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setOldValues(oldValues);
        auditLog.setNewValues(newValues);
        auditLog.setDescription(description);
        auditLog.setTenantId(ga.gabedt.tenant.TenantContext.getTenantId());

        // Resolve current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            userRepository.findByEmailAndDeletedFalse(auth.getName())
                    .ifPresent(auditLog::setUser);
        }

        // Resolve IP address from request context
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isBlank()) {
                    ip = request.getRemoteAddr();
                }
                auditLog.setIpAddress(ip);
            }
        } catch (Exception e) {
            log.debug("Could not resolve IP address for audit log", e);
        }

        auditLogRepository.save(auditLog);
        log.info("AUDIT: [{}] {} {} - {}", action, entityType, entityId, description);
    }

    /**
     * Shorthand for simple actions without old/new values.
     */
    @Transactional
    public void logAction(String action, String entityType, UUID entityId, String description) {
        logAction(action, entityType, entityId, null, null, description);
    }

    /**
     * Query audit logs with pagination.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(String entityType, UUID userId, Pageable pageable) {
        // Un admin d'établissement ne voit que son établissement ; un SUPER_ADMIN sans établissement ciblé voit tout
        UUID tenantId = ga.gabedt.tenant.TenantContext.getTenantId();
        org.springframework.data.jpa.domain.Specification<AuditLog> spec = (root, query, cb) -> cb.isFalse(root.get("deleted"));
        if (tenantId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tenantId"), tenantId));
        }
        if (entityType != null && !entityType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityType"), entityType));
        }
        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("user").get("id"), userId));
        }
        Pageable sorted = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> page = auditLogRepository.findAll(spec, sorted);

        return page.map(this::mapToDto);
    }

    private AuditLogDto mapToDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setOldValues(log.getOldValues());
        dto.setNewValues(log.getNewValues());
        dto.setIpAddress(log.getIpAddress());
        dto.setDescription(log.getDescription());
        dto.setCreatedAt(log.getCreatedAt());

        if (log.getUser() != null) {
            dto.setUserEmail(log.getUser().getEmail());
            dto.setUserName(log.getUser().getFirstName() + " " + log.getUser().getLastName());
        }

        return dto;
    }
}

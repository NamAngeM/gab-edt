package ga.gabedt.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import java.util.UUID;

@Slf4j
@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String TENANT_HEADER = "X-Tenant-ID";

    private final ga.gabedt.school.SchoolRepository schoolRepository;
    private static UUID defaultTenantId = null;

    public TenantInterceptor(ga.gabedt.school.SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String tenantIdHeader = request.getHeader(TENANT_HEADER);
        
        if (tenantIdHeader != null && !tenantIdHeader.isBlank()) {
            try {
                UUID tenantId = UUID.fromString(tenantIdHeader);
                TenantContext.setTenantId(tenantId);
                log.debug("Set tenant context to: {}", tenantId);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid tenant ID format in header: {}", tenantIdHeader);
            }
        } else {
            // MVP Fallback: If no tenant header, use a default tenant if available
            log.warn("No Tenant ID provided in header. Proceeding with caution (MVP mode)");
            if (defaultTenantId == null) {
                schoolRepository.findAll().stream().findFirst().ifPresent(s -> defaultTenantId = s.getId());
            }
            if (defaultTenantId != null) {
                TenantContext.setTenantId(defaultTenantId);
            }
        }
        
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        TenantContext.clear();
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        TenantContext.clear();
    }
}

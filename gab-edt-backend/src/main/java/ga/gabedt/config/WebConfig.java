package ga.gabedt.config;

import ga.gabedt.tenant.TenantInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final TenantInterceptor tenantInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Appliquer l'intercepteur de tenant sur toutes les routes de l'API
        registry.addInterceptor(tenantInterceptor).addPathPatterns("/api/**");
    }
}

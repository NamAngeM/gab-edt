package ga.gabedt.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration OpenAPI / Swagger pour la documentation automatique de l'API.
 * <p>
 * Accessible sur : /swagger-ui.html
 * <p>
 * Cahier des charges section 56 : la documentation doit permettre
 * à l'équipe frontend de comprendre les endpoints, paramètres,
 * schémas JSON, erreurs, permissions et exemples.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI gabEdtOpenAPI() {
        final String securitySchemeName = "Bearer JWT";

        return new OpenAPI()
                .info(new Info()
                        .title("GAB-EDT API")
                        .description("""
                                API REST de la plateforme GAB-EDT — Gestion des emplois du temps
                                pour les établissements scolaires et universitaires du Gabon.
                                
                                **Version** : MVP
                                
                                **Authentification** : JWT Bearer Token
                                """)
                        .version("0.1.0")
                        .contact(new Contact()
                                .name("GAB-EDT Team")
                                .email("contact@gab-edt.ga"))
                        .license(new License()
                                .name("Propriétaire")
                                .url("https://gab-edt.ga")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Serveur de développement")
                ))
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Entrez votre JWT access token")));
    }
}

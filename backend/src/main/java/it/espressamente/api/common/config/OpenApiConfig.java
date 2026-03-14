package it.espressamente.api.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${app.admin.base-url:http://localhost:3020}")
    private String adminBaseUrl;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Espressamente API")
                .version("2.0.0")
                .description("""
                    API backend della piattaforma **Espressamente Coffee**.

                    ## Autenticazione
                    1. Esegui `POST /v1/auth/login` con username e password
                    2. Copia il `accessToken` dalla risposta
                    3. Clicca **Authorize** in alto e inserisci il token

                    ## Ruoli
                    - `SUPER_ADMIN` — accesso completo
                    - `STORE_MANAGER` — CRM, fatture, magazzino
                    - `EMPLOYEE` — sola lettura
                    """)
                .contact(new Contact()
                    .name("Espressamente Coffee")
                    .email("admin@espressamente.eu")
                    .url("https://espressamente.eu"))
                .license(new License()
                    .name("Proprietario")
                    .url("https://espressamente.eu")))
            .servers(List.of(
                new Server().url("http://localhost:8080/api").description("Local"),
                new Server().url("https://stg.espressamente.eu/api").description("Staging"),
                new Server().url("https://espressamente.eu/api").description("Production")))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Inserisci il token JWT ottenuto da POST /v1/auth/login")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}

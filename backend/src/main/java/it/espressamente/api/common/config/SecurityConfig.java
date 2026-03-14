package it.espressamente.api.common.config;

import it.espressamente.api.auth.security.AdminUserDetailsService;
import it.espressamente.api.auth.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;

// Nota: Content-Security-Policy (CSP) e altri security headers (HSTS, X-Frame-Options, etc.)
// sono gestiti a livello Nginx, non qui, dato che gli asset statici sono serviti da Next.js.
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AdminUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":false,\"message\":\"Non autorizzato\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Endpoint pubblici
                .requestMatchers(HttpMethod.GET,  "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/v1/products/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/v1/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/v1/brands/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/v1/pages/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/v1/contact").permitAll()
                .requestMatchers(HttpMethod.POST, "/v1/service-request").permitAll()
                .requestMatchers(HttpMethod.POST, "/v1/comodato").permitAll()
                // Auth
                .requestMatchers("/v1/auth/**").permitAll()
                // Swagger & Actuator
                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                // Admin — richiede autenticazione JWT
                .requestMatchers("/v1/admin/**").authenticated()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

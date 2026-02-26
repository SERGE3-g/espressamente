package it.espressamente.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(HttpMethod.GET, "/v1/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/v1/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/v1/brands/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/v1/pages/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/v1/contact").permitAll()
                .requestMatchers(HttpMethod.POST, "/v1/service-request").permitAll()
                .requestMatchers("/v1/auth/**").permitAll()
                // Swagger
                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                // Actuator
                .requestMatchers("/actuator/health").permitAll()
                // Admin endpoints - require authentication
                .requestMatchers("/v1/admin/**").authenticated()
                .anyRequest().authenticated()
            );

        // TODO: aggiungere JwtAuthenticationFilter quando implementato
        // http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

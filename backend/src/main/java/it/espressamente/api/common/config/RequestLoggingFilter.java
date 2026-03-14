package it.espressamente.api.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Logga ogni richiesta HTTP con metodo, URI, status, durata e IP.
 * Aggiunge un correlation ID (X-Request-Id) per tracciare le richieste nei log.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip health check e asset statici
        String uri = request.getRequestURI();
        if (uri.contains("/actuator/") || uri.contains("/uploads/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Genera o usa il request ID esistente
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString().substring(0, 8);
        }
        response.setHeader(REQUEST_ID_HEADER, requestId);

        String method = request.getMethod();
        String ip = request.getRemoteAddr();
        long start = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            int status = response.getStatus();

            if (status >= 500) {
                log.error("[{}] {} {} — {} ({}ms) IP:{}", requestId, method, uri, status, duration, ip);
            } else if (status >= 400) {
                // 4xx = errore client (auth fallita, not found, validazione, rate limit)
                log.warn("[{}] {} {} — {} ({}ms) IP:{}", requestId, method, uri, status, duration, ip);
            } else {
                log.info("[{}] {} {} — {} ({}ms)", requestId, method, uri, status, duration);
            }
        }
    }
}

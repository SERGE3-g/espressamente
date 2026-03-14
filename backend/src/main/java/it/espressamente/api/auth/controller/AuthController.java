package it.espressamente.api.auth.controller;

import it.espressamente.api.admin.service.AuditService;
import it.espressamente.api.auth.dto.AuthRequest;
import it.espressamente.api.auth.dto.ForgotPasswordRequest;
import it.espressamente.api.auth.dto.ResetPasswordRequest;
import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.auth.dto.AuthResponse;
import it.espressamente.api.auth.entity.AdminUser;
import it.espressamente.api.auth.entity.RefreshToken;
import it.espressamente.api.auth.repository.AdminUserRepository;
import it.espressamente.api.auth.security.JwtService;
import it.espressamente.api.auth.service.RefreshTokenService;
import it.espressamente.api.notification.service.EmailService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final int COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 giorni in secondi
    private static final int MAX_FAILED_ATTEMPTS = 5;         // per username
    private static final int MAX_FAILED_ATTEMPTS_IP = 10;     // per IP (più alto perché più utenti possono condividere IP)
    private static final long LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minuti

    private static final int RESET_TOKEN_EXPIRY_MINUTES = 30;

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AdminUserRepository adminUserRepository;
    private final AuditService auditService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.admin.base-url:http://localhost:3020}")
    private String adminBaseUrl;

    // ── Brute force protection ──────────────────────────────────────────────────
    private record LoginAttempts(int count, Instant firstAttempt, boolean alertSent) {
        LoginAttempts() { this(0, Instant.now(), false); }
        LoginAttempts increment() {
            return new LoginAttempts(count + 1, firstAttempt, alertSent);
        }
        LoginAttempts withAlertSent() {
            return new LoginAttempts(count, firstAttempt, true);
        }
        boolean isLockedForUser() {
            return count >= MAX_FAILED_ATTEMPTS
                    && Instant.now().isBefore(firstAttempt.plusMillis(LOCKOUT_DURATION_MS));
        }
        boolean isLockedForIp() {
            return count >= MAX_FAILED_ATTEMPTS_IP
                    && Instant.now().isBefore(firstAttempt.plusMillis(LOCKOUT_DURATION_MS));
        }
        boolean isExpired() {
            return Instant.now().isAfter(firstAttempt.plusMillis(LOCKOUT_DURATION_MS));
        }
    }

    // Tracking per username e per IP
    private final ConcurrentHashMap<String, LoginAttempts> failedByUsername = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LoginAttempts> failedByIp = new ConcurrentHashMap<>();

    // ── POST /v1/auth/login ────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String username = request.getUsername();
        String ip = httpRequest.getRemoteAddr();

        // ── Brute force check per USERNAME ──
        LoginAttempts userAttempts = failedByUsername.get(username);
        if (userAttempts != null) {
            if (userAttempts.isExpired()) {
                failedByUsername.remove(username);
            } else if (userAttempts.isLockedForUser()) {
                handleLockout("ACCOUNT_LOCKED", "Account bloccato (username): " + username, ip, userAttempts, "user:" + username);
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(ApiResponse.error("Account temporaneamente bloccato per troppi tentativi. " +
                                "Riprova tra 15 minuti oppure usa \"Password dimenticata?\" per reimpostarla. " +
                                "Se il problema persiste, contatta l'amministratore."));
            }
        }

        // ── Brute force check per IP ──
        LoginAttempts ipAttempts = failedByIp.get(ip);
        if (ipAttempts != null) {
            if (ipAttempts.isExpired()) {
                failedByIp.remove(ip);
            } else if (ipAttempts.isLockedForIp()) {
                handleLockout("IP_LOCKED", "IP bloccato per troppi tentativi: " + ip, ip, ipAttempts, "ip:" + ip);
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(ApiResponse.error("Troppi tentativi da questo indirizzo. " +
                                "Riprova tra 15 minuti oppure contatta l'amministratore."));
            }
        }

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.getPassword()));
        } catch (BadCredentialsException e) {
            // Registra tentativo fallito per username
            failedByUsername.merge(username,
                    new LoginAttempts(1, Instant.now(), false),
                    (existing, newVal) -> existing.isExpired() ? newVal : existing.increment());

            // Registra tentativo fallito per IP
            failedByIp.merge(ip,
                    new LoginAttempts(1, Instant.now(), false),
                    (existing, newVal) -> existing.isExpired() ? newVal : existing.increment());

            auditService.log("LOGIN_FAILED", "AUTH", null,
                    "Tentativo login fallito per utente: " + username + " da IP: " + ip);

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Credenziali non valide"));
        }

        // Login riuscito — reset tentativi per username (IP resta, potrebbe essere condiviso)
        failedByUsername.remove(username);

        AdminUser user = adminUserRepository.findByUsername(username)
                .orElseThrow();

        String accessToken = jwtService.generateToken(user.getUsername(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.create(
                user,
                ip,
                httpRequest.getHeader("User-Agent"));

        setRefreshCookie(httpResponse, refreshToken.getToken());

        auditService.log("LOGIN_SUCCESS", "AUTH", null,
                "Login riuscito per utente: " + username + " da IP: " + ip);

        return ResponseEntity.ok(ApiResponse.ok(buildAuthResponse(accessToken, user)));
    }

    /** Gestisce un lockout: audit log + email di allerta (una sola volta per finestra di blocco) */
    private void handleLockout(String action, String description, String ip,
                               LoginAttempts attempts, String mapKey) {
        auditService.log(action, "AUTH", null, description + " da IP: " + ip);

        // Invia email solo la prima volta che scatta il blocco
        if (!attempts.alertSent()) {
            ConcurrentHashMap<String, LoginAttempts> map = mapKey.startsWith("ip:") ? failedByIp : failedByUsername;
            map.computeIfPresent(mapKey.substring(mapKey.indexOf(':') + 1),
                    (k, v) -> v.withAlertSent());

            emailService.sendSecurityAlert(description, ip, attempts.count());
        }
    }

    // ── POST /v1/auth/refresh ──────────────────────────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String tokenValue = extractRefreshCookie(httpRequest);
        if (tokenValue == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh token mancante"));
        }

        Optional<RefreshToken> tokenOpt = refreshTokenService.findByToken(tokenValue);
        if (tokenOpt.isEmpty() || !tokenOpt.get().isValid()) {
            clearRefreshCookie(httpResponse);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh token non valido o scaduto"));
        }

        RefreshToken oldToken = tokenOpt.get();
        refreshTokenService.revoke(oldToken);

        AdminUser user = oldToken.getAdminUser();
        String newAccessToken = jwtService.generateToken(user.getUsername(), user.getRole().name());
        RefreshToken newRefreshToken = refreshTokenService.create(
                user,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));

        setRefreshCookie(httpResponse, newRefreshToken.getToken());

        return ResponseEntity.ok(ApiResponse.ok(buildAuthResponse(newAccessToken, user)));
    }

    // ── POST /v1/auth/logout ───────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String tokenValue = extractRefreshCookie(httpRequest);
        if (tokenValue != null) {
            refreshTokenService.findByToken(tokenValue)
                    .ifPresent(refreshTokenService::revoke);
        }
        clearRefreshCookie(httpResponse);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ── POST /v1/auth/forgot-password ───────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();

        // Risposta sempre uguale per non rivelare se l'email esiste
        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            AdminUser user = userOpt.get();
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES));
            adminUserRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token, adminBaseUrl);

            auditService.log("PASSWORD_RESET_REQUEST", "AUTH", user.getId(),
                    "Richiesta reset password per: " + user.getUsername() + " da IP: " + ip);
        }

        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ── POST /v1/auth/reset-password ─────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();

        Optional<AdminUser> userOpt = adminUserRepository.findByPasswordResetToken(request.getToken());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Token non valido o scaduto"));
        }

        AdminUser user = userOpt.get();
        if (user.getPasswordResetTokenExpiry() == null
                || user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            // Token scaduto — pulisci
            user.setPasswordResetToken(null);
            user.setPasswordResetTokenExpiry(null);
            adminUserRepository.save(user);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Token scaduto. Richiedi un nuovo reset."));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        adminUserRepository.save(user);

        auditService.log("PASSWORD_RESET_SUCCESS", "AUTH", user.getId(),
                "Password reimpostata per: " + user.getUsername() + " da IP: " + ip);

        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(String accessToken, AdminUser user) {
        AuthResponse.AuthResponseBuilder builder = AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs() / 1000)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name());

        if (user.getStore() != null) {
            builder.storeId(user.getStore().getId())
                   .storeName(user.getStore().getName());
        }

        return builder.build();
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        String sameSite = secureCookie ? "Strict" : "Lax";
        StringBuilder sb = new StringBuilder();
        sb.append(REFRESH_COOKIE).append("=").append(token)
          .append("; Path=/")
          .append("; Max-Age=").append(COOKIE_MAX_AGE)
          .append("; HttpOnly")
          .append("; SameSite=").append(sameSite);
        if (secureCookie) {
            sb.append("; Secure");
        }
        response.addHeader("Set-Cookie", sb.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        String sameSite = secureCookie ? "Strict" : "Lax";
        StringBuilder sb = new StringBuilder();
        sb.append(REFRESH_COOKIE).append("=")
          .append("; Path=/")
          .append("; Max-Age=0")
          .append("; HttpOnly")
          .append("; SameSite=").append(sameSite);
        if (secureCookie) {
            sb.append("; Secure");
        }
        response.addHeader("Set-Cookie", sb.toString());
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_COOKIE.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}

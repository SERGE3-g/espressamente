package it.espressamente.api.auth.service;

import it.espressamente.api.auth.entity.AdminUser;
import it.espressamente.api.auth.entity.RefreshToken;
import it.espressamente.api.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Transactional
    public RefreshToken create(AdminUser user, String ipAddress, String userAgent) {
        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .adminUser(user)
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .ipAddress(ipAddress)
                .userAgent(userAgent != null && userAgent.length() > 255
                        ? userAgent.substring(0, 255) : userAgent)
                .build();
        return refreshTokenRepository.save(token);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public void revoke(RefreshToken token) {
        token.setRevoked(true);
        token.setRevokedAt(Instant.now());
        refreshTokenRepository.save(token);
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId, Instant.now());
    }

    @Transactional
    public void cleanupExpired() {
        refreshTokenRepository.deleteExpiredAndRevoked(Instant.now());
    }
}

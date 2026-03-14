package it.espressamente.api.admin.service;

import it.espressamente.api.admin.dto.ChangePasswordRequest;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.auth.entity.AdminUser;
import it.espressamente.api.auth.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminSettingsService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        AdminUser user = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + username));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("La password attuale non è corretta");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminUserRepository.save(user);
        auditService.log("UPDATE", "AdminUser", user.getId(), "Password modificata per: " + username);
    }
}

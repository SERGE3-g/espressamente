package it.espressamente.api.admin.service;

import it.espressamente.api.admin.dto.AdminUserRequest;
import it.espressamente.api.admin.dto.AdminUserResponse;
import it.espressamente.api.auth.entity.AdminUser;
import it.espressamente.api.auth.entity.Store;
import it.espressamente.api.auth.enums.UserRole;
import it.espressamente.api.auth.repository.AdminUserRepository;
import it.espressamente.api.auth.repository.StoreRepository;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public List<AdminUserResponse> findAll() {
        return adminUserRepository.findAllWithStore().stream()
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());
    }

    public AdminUserResponse findById(Long id) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + id));
        return AdminUserResponse.from(user);
    }

    @Transactional
    public AdminUserResponse create(AdminUserRequest request) {
        if (adminUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username già in uso: " + request.getUsername());
        }

        UserRole role = UserRole.valueOf(request.getRole());
        Store store = resolveStore(request.getStoreId(), role);

        AdminUser user = AdminUser.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(role)
                .store(store)
                .isActive(true)
                .build();

        AdminUser saved = adminUserRepository.save(user);
        auditService.log("CREATE", "AdminUser", saved.getId(), "Creato utente: " + saved.getUsername() + " (" + saved.getRole() + ")");
        return AdminUserResponse.from(saved);
    }

    @Transactional
    public AdminUserResponse update(Long id, AdminUserRequest request) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + id));

        UserRole role = UserRole.valueOf(request.getRole());
        Store store = resolveStore(request.getStoreId(), role);

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(role);
        user.setStore(store);

        // Aggiorna password solo se fornita
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        AdminUser updated = adminUserRepository.save(user);
        auditService.log("UPDATE", "AdminUser", updated.getId(), "Aggiornato utente: " + updated.getUsername());
        return AdminUserResponse.from(updated);
    }

    @Transactional
    public void toggleActive(Long id) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + id));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        adminUserRepository.save(user);
        auditService.log("TOGGLE_ACTIVE", "AdminUser", id, "Utente " + user.getUsername() + " → " + (user.getIsActive() ? "attivo" : "disattivato"));
    }

    private Store resolveStore(Long storeId, UserRole role) {
        if (role == UserRole.SUPER_ADMIN) {
            return null; // SUPER_ADMIN non è legato a un negozio
        }
        if (storeId == null) {
            throw new IllegalArgumentException("Il negozio è obbligatorio per il ruolo " + role);
        }
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Negozio non trovato: " + storeId));
    }
}

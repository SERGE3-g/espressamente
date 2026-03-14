package it.espressamente.api.admin.controller;

import it.espressamente.api.admin.dto.AdminUserRequest;
import it.espressamente.api.admin.dto.AdminUserResponse;
import it.espressamente.api.admin.dto.StoreResponse;
import it.espressamente.api.auth.repository.StoreRepository;
import it.espressamente.api.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import it.espressamente.api.admin.service.AdminUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final StoreRepository storeRepository;

    // ── GET /v1/admin/users ─────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.findAll()));
    }

    // ── GET /v1/admin/users/{id} ────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.findById(id)));
    }

    // ── POST /v1/admin/users ────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserResponse>> create(
            @Valid @RequestBody AdminUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.create(request)));
    }

    // ── PUT /v1/admin/users/{id} ────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.update(id, request)));
    }

    // ── PATCH /v1/admin/users/{id}/toggle-active ────────────────────────────
    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable Long id) {
        adminUserService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ── GET /v1/admin/users/stores ──────────────────────────────────────────
    @GetMapping("/stores")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<StoreResponse>>> getStores() {
        List<StoreResponse> stores = storeRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(StoreResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(stores));
    }
}

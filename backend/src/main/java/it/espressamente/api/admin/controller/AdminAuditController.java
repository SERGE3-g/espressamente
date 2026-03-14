package it.espressamente.api.admin.controller;

import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.admin.entity.AdminAuditLog;
import it.espressamente.api.admin.repository.AdminAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminAuditController {

    private final AdminAuditLogRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminAuditLog>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<AdminAuditLog> logs = repository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, Math.min(size, 100)));
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}

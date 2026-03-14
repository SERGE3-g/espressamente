package it.espressamente.api.contact.controller;

import it.espressamente.api.contact.dto.ComodatoFormRequest;
import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.contact.entity.ComodatoRequest;
import it.espressamente.api.contact.enums.RequestStatus;
import it.espressamente.api.contact.service.ComodatoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ComodatoController {

    private final ComodatoService comodatoService;

    // ── Public ────────────────────────────────────────────────────────────────

    @PostMapping("/v1/comodato")
    public ResponseEntity<ApiResponse<Void>> submit(@Valid @RequestBody ComodatoFormRequest form) {
        comodatoService.submit(form);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Richiesta inviata! Ti contatteremo entro 24 ore lavorative."));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    @GetMapping("/v1/admin/comodato")
    public Page<ComodatoRequest> getAll(
            @RequestParam(required = false) RequestStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        if (status != null) return comodatoService.getByStatus(status, pageable);
        return comodatoService.getAll(pageable);
    }

    @GetMapping("/v1/admin/comodato/{id}")
    public ApiResponse<ComodatoRequest> getById(@PathVariable Long id) {
        return ApiResponse.ok(comodatoService.getById(id));
    }

    @PatchMapping("/v1/admin/comodato/{id}/status")
    public ApiResponse<ComodatoRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status,
            @RequestParam(required = false) String internalNotes) {
        return ApiResponse.ok(comodatoService.updateStatus(id, status, internalNotes));
    }
}

package it.espressamente.api.customer.controller;

import it.espressamente.api.customer.dto.CustomerInteractionRequest;
import it.espressamente.api.customer.dto.CustomerRequest;
import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.customer.dto.CustomerInteractionResponse;
import it.espressamente.api.customer.dto.CustomerResponse;
import it.espressamente.api.customer.service.AdminCustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','STORE_MANAGER')")
public class AdminCustomerController {

    private final AdminCustomerService customerService;

    // ── CRUD ─────────────────────────────────────────────────────────────────────

    @GetMapping
    public ApiResponse<Page<CustomerResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String clientType,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(customerService.getAll(search, clientType, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomerResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(customerService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> create(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse created = customerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @PutMapping("/{id}")
    public ApiResponse<CustomerResponse> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return ApiResponse.ok(customerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        customerService.deactivate(id);
        return ApiResponse.ok("Cliente disattivato con successo");
    }

    // ── Linked requests ─────────────────────────────────────────────────────────

    @GetMapping("/{id}/comodato")
    public ApiResponse<List<?>> getComodato(@PathVariable Long id) {
        return ApiResponse.ok(customerService.getComodatoByCustomer(id));
    }

    @GetMapping("/{id}/contatti")
    public ApiResponse<List<?>> getContatti(@PathVariable Long id) {
        return ApiResponse.ok(customerService.getContattiByCustomer(id));
    }

    @GetMapping("/{id}/assistenza")
    public ApiResponse<List<?>> getAssistenza(@PathVariable Long id) {
        return ApiResponse.ok(customerService.getAssistenzaByCustomer(id));
    }

    // ── Interactions ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/interactions")
    public ApiResponse<List<CustomerInteractionResponse>> getInteractions(@PathVariable Long id) {
        return ApiResponse.ok(customerService.getInteractions(id));
    }

    @PostMapping("/{id}/interactions")
    public ResponseEntity<ApiResponse<CustomerInteractionResponse>> createInteraction(
            @PathVariable Long id, @Valid @RequestBody CustomerInteractionRequest request) {
        CustomerInteractionResponse created = customerService.createInteraction(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @DeleteMapping("/{customerId}/interactions/{interactionId}")
    public ApiResponse<Void> deleteInteraction(@PathVariable Long customerId, @PathVariable Long interactionId) {
        customerService.deleteInteraction(customerId, interactionId);
        return ApiResponse.ok("Interazione eliminata con successo");
    }
}

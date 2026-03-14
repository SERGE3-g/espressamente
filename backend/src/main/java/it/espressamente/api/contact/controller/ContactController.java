package it.espressamente.api.contact.controller;

import it.espressamente.api.contact.dto.ContactFormRequest;
import it.espressamente.api.contact.dto.ServiceFormRequest;
import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.contact.entity.ContactRequest;
import it.espressamente.api.contact.entity.ServiceRequest;
import it.espressamente.api.contact.enums.RequestStatus;
import it.espressamente.api.contact.service.ContactService;
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
public class ContactController {

    private final ContactService contactService;

    // ── Public: Form Submissions ──

    @PostMapping("/v1/contact")
    public ResponseEntity<ApiResponse<Void>> submitContact(@Valid @RequestBody ContactFormRequest form) {
        contactService.submitContact(form);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Richiesta inviata con successo. Ti ricontatteremo al più presto!"));
    }

    @PostMapping("/v1/service-request")
    public ResponseEntity<ApiResponse<Void>> submitServiceRequest(@Valid @RequestBody ServiceFormRequest form) {
        contactService.submitServiceRequest(form);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Richiesta assistenza inviata. Sarai ricontattato a breve!"));
    }

    // ── Admin: Manage Requests ──

    @GetMapping("/v1/admin/contacts")
    public Page<ContactRequest> getContacts(
            @RequestParam(required = false) RequestStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        if (status != null) {
            return contactService.getContactsByStatus(status, pageable);
        }
        return contactService.getAllContacts(pageable);
    }

    @PatchMapping("/v1/admin/contacts/{id}/status")
    public ApiResponse<ContactRequest> updateContactStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status) {
        return ApiResponse.ok(contactService.updateContactStatus(id, status));
    }

    @GetMapping("/v1/admin/service-requests")
    public Page<ServiceRequest> getServiceRequests(@PageableDefault(size = 20) Pageable pageable) {
        return contactService.getAllServiceRequests(pageable);
    }

    @PatchMapping("/v1/admin/service-requests/{id}/status")
    public ApiResponse<ServiceRequest> updateServiceStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status) {
        return ApiResponse.ok(contactService.updateServiceStatus(id, status));
    }
}

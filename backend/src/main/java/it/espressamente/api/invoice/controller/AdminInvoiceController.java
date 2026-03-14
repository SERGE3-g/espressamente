package it.espressamente.api.invoice.controller;

import it.espressamente.api.invoice.dto.InvoiceRequest;
import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.invoice.dto.InvoiceResponse;
import it.espressamente.api.invoice.service.AdminInvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','STORE_MANAGER')")
public class AdminInvoiceController {

    private final AdminInvoiceService invoiceService;

    @GetMapping
    public ApiResponse<Page<InvoiceResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(invoiceService.getAll(status, search, dateFrom, dateTo, pageable));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        byte[] csv = invoiceService.exportCsv(status, search, dateFrom, dateTo);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "fatture-export.csv");
        return ResponseEntity.ok().headers(headers).body(csv);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdf = invoiceService.generatePdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", invoiceService.getPdfFilename(id));
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PostMapping("/{id}/send-email")
    public ApiResponse<Void> sendEmail(@PathVariable Long id) {
        invoiceService.sendInvoiceEmail(id);
        return ApiResponse.ok("Email fattura inviata con successo");
    }

    @GetMapping("/{id}")
    public ApiResponse<InvoiceResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(invoiceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(@Valid @RequestBody InvoiceRequest request) {
        InvoiceResponse created = invoiceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @PutMapping("/{id}")
    public ApiResponse<InvoiceResponse> update(@PathVariable Long id, @Valid @RequestBody InvoiceRequest request) {
        return ApiResponse.ok(invoiceService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<InvoiceResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ApiResponse.ok(invoiceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ApiResponse.ok("Fattura eliminata con successo");
    }
}

package it.espressamente.api.invoice.controller;

import it.espressamente.api.invoice.dto.AccountingEntryRequest;
import it.espressamente.api.invoice.dto.AccountingEntryResponse;
import it.espressamente.api.invoice.dto.AccountingSummaryResponse;
import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.invoice.dto.ProfitAndLossResponse;
import it.espressamente.api.invoice.service.AdminAccountingService;
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
@RequestMapping("/v1/admin/accounting")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','STORE_MANAGER')")
public class AdminAccountingController {

    private final AdminAccountingService accountingService;

    @GetMapping
    public ApiResponse<Page<AccountingEntryResponse>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(accountingService.getAll(type, category, search, dateFrom, dateTo, pageable));
    }

    @GetMapping("/summary")
    public ApiResponse<AccountingSummaryResponse> getSummary(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category) {
        return ApiResponse.ok(accountingService.getSummary(from, to, type, category));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        String csv = accountingService.exportCsv(type, category, search, dateFrom, dateTo);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=contabilita-export.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    @GetMapping("/profit-loss")
    public ApiResponse<ProfitAndLossResponse> getProfitAndLoss(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ApiResponse.ok(accountingService.getProfitAndLoss(from, to));
    }

    @GetMapping("/{id}")
    public ApiResponse<AccountingEntryResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(accountingService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountingEntryResponse>> create(@Valid @RequestBody AccountingEntryRequest request) {
        AccountingEntryResponse created = accountingService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @PutMapping("/{id}")
    public ApiResponse<AccountingEntryResponse> update(@PathVariable Long id, @Valid @RequestBody AccountingEntryRequest request) {
        return ApiResponse.ok(accountingService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        accountingService.delete(id);
        return ApiResponse.ok("Registrazione eliminata con successo");
    }
}

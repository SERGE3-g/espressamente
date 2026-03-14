package it.espressamente.api.warehouse.controller;

import it.espressamente.api.warehouse.dto.ImportResult;
import it.espressamente.api.warehouse.dto.StockAdjustRequest;
import it.espressamente.api.warehouse.dto.WarehouseMovementResponse;
import it.espressamente.api.warehouse.dto.WarehouseStockResponse;
import it.espressamente.api.warehouse.service.WarehouseImportService;
import it.espressamente.api.warehouse.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin/warehouse")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','STORE_MANAGER')")
public class AdminWarehouseController {

    private final WarehouseService warehouseService;
    private final WarehouseImportService importService;

    @GetMapping("/stock")
    public ResponseEntity<Map<String, Object>> getStock() {
        List<WarehouseStockResponse> stock = warehouseService.getStock();
        return ResponseEntity.ok(Map.of("success", true, "data", stock));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<Map<String, Object>> getLowStock() {
        List<WarehouseStockResponse> lowStock = warehouseService.getLowStock();
        return ResponseEntity.ok(Map.of("success", true, "data", lowStock));
    }

    @PostMapping("/adjust")
    public ResponseEntity<Map<String, Object>> adjustStock(@Valid @RequestBody StockAdjustRequest request) {
        WarehouseStockResponse result = warehouseService.adjustStock(request);
        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> importFile(@RequestParam("file") MultipartFile file) {
        try {
            String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            ImportResult result = importService.importFile(file, adminUsername);
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Errore import: " + e.getMessage()));
        }
    }

    @GetMapping("/movements")
    public ResponseEntity<Map<String, Object>> getMovements(
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WarehouseMovementResponse> movements = warehouseService.getMovements(productId, PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of("success", true, "data", movements));
    }
}

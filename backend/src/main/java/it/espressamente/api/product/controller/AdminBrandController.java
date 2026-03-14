package it.espressamente.api.product.controller;

import it.espressamente.api.product.dto.BrandRequest;
import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.product.dto.BrandResponse;
import it.espressamente.api.product.service.AdminBrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import it.espressamente.api.product.entity.Brand;

@RestController
@RequestMapping("/v1/admin/brands")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminBrandController {

    private final AdminBrandService adminBrandService;

    @GetMapping
    public ApiResponse<List<BrandResponse>> getAll() {
        return ApiResponse.ok(adminBrandService.getAll());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> create(@Valid @RequestBody BrandRequest request) {
        BrandResponse created = adminBrandService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @PutMapping("/{id}")
    public ApiResponse<BrandResponse> update(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        return ApiResponse.ok(adminBrandService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        adminBrandService.delete(id);
        return ApiResponse.ok("Brand eliminato con successo");
    }
}

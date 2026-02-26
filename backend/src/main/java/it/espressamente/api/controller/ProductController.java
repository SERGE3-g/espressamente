package it.espressamente.api.controller;

import it.espressamente.api.dto.request.ProductRequest;
import it.espressamente.api.dto.response.ApiResponse;
import it.espressamente.api.dto.response.ProductResponse;
import it.espressamente.api.model.enums.ProductType;
import it.espressamente.api.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ── Public Endpoints ──

    @GetMapping("/v1/products")
    public Page<ProductResponse> getAll(
            @RequestParam(required = false) ProductType type,
            @PageableDefault(size = 12) Pageable pageable) {
        if (type != null) {
            return productService.getByType(type, pageable);
        }
        return productService.getAll(pageable);
    }

    @GetMapping("/v1/products/featured")
    public List<ProductResponse> getFeatured() {
        return productService.getFeatured();
    }

    @GetMapping("/v1/products/search")
    public Page<ProductResponse> search(
            @RequestParam String q,
            @PageableDefault(size = 12) Pageable pageable) {
        return productService.search(q, pageable);
    }

    @GetMapping("/v1/products/by-category/{categorySlug}")
    public Page<ProductResponse> getByCategory(
            @PathVariable String categorySlug,
            @PageableDefault(size = 12) Pageable pageable) {
        return productService.getByCategory(categorySlug, pageable);
    }

    @GetMapping("/v1/products/by-brand/{brandSlug}")
    public Page<ProductResponse> getByBrand(
            @PathVariable String brandSlug,
            @PageableDefault(size = 12) Pageable pageable) {
        return productService.getByBrand(brandSlug, pageable);
    }

    @GetMapping("/v1/products/{slug}")
    public ProductResponse getBySlug(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }

    // ── Admin Endpoints ──

    @PostMapping("/v1/admin/products")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(product));
    }

    @PutMapping("/v1/admin/products/{id}")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok(productService.update(id, request));
    }

    @DeleteMapping("/v1/admin/products/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.ok("Prodotto eliminato");
    }
}

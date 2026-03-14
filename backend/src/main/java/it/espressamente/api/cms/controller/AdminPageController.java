package it.espressamente.api.cms.controller;

import it.espressamente.api.cms.dto.PageRequest;
import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.cms.dto.PageResponse;
import it.espressamente.api.cms.service.AdminPageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/pages")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminPageController {

    private final AdminPageService adminPageService;

    @GetMapping
    public ApiResponse<List<PageResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean published) {
        return ApiResponse.ok(adminPageService.search(search, published));
    }

    @GetMapping("/{slug}")
    public ApiResponse<PageResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(adminPageService.getBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PageResponse>> create(@Valid @RequestBody PageRequest request) {
        PageResponse created = adminPageService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @PutMapping("/{id}")
    public ApiResponse<PageResponse> update(@PathVariable Long id, @Valid @RequestBody PageRequest request) {
        return ApiResponse.ok(adminPageService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        adminPageService.delete(id);
        return ApiResponse.ok("Pagina eliminata con successo");
    }
}

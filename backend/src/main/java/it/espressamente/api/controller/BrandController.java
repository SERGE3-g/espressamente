package it.espressamente.api.controller;

import it.espressamente.api.dto.response.BrandResponse;
import it.espressamente.api.model.entity.Brand;
import it.espressamente.api.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    @GetMapping("/v1/brands")
    public List<BrandResponse> getAll() {
        return brandRepository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/v1/brands/{slug}")
    public BrandResponse getBySlug(@PathVariable String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand non trovato"));
        return toResponse(brand);
    }

    private BrandResponse toResponse(Brand b) {
        return BrandResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .slug(b.getSlug())
                .logo(b.getLogo())
                .description(b.getDescription())
                .website(b.getWebsite())
                .build();
    }
}

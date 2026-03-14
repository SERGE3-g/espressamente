package it.espressamente.api.product.service;

import com.github.slugify.Slugify;
import it.espressamente.api.product.dto.BrandRequest;
import it.espressamente.api.product.dto.BrandResponse;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.product.entity.Brand;
import it.espressamente.api.admin.service.AuditService;
import it.espressamente.api.product.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminBrandService {

    private final BrandRepository brandRepository;
    private final AuditService auditService;
    private final Slugify slugify = Slugify.builder().build();

    public List<BrandResponse> getAll() {
        return brandRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BrandResponse getById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand non trovato: " + id));
        return toResponse(brand);
    }

    @Transactional
    public BrandResponse create(BrandRequest request) {
        Brand brand = new Brand();
        mapRequestToEntity(request, brand);

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? slugify.slugify(request.getSlug())
                : slugify.slugify(request.getName());
        brand.setSlug(slug);

        Brand saved = brandRepository.save(brand);
        auditService.log("CREATE", "Brand", saved.getId(), "Creato brand: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand non trovato: " + id));
        mapRequestToEntity(request, brand);

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            brand.setSlug(slugify.slugify(request.getSlug()));
        }

        Brand saved = brandRepository.save(brand);
        auditService.log("UPDATE", "Brand", saved.getId(), "Aggiornato brand: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand non trovato: " + id));
        brand.setIsActive(false);
        brandRepository.save(brand);
        auditService.log("DELETE", "Brand", id, "Disattivato brand: " + brand.getName());
    }

    // ── Mapping ──

    private void mapRequestToEntity(BrandRequest req, Brand brand) {
        brand.setName(req.getName());
        brand.setDescription(req.getDescription());
        if (req.getSortOrder() != null) {
            brand.setSortOrder(req.getSortOrder());
        }
    }

    private BrandResponse toResponse(Brand b) {
        return BrandResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .slug(b.getSlug())
                .logo(b.getLogo())
                .description(b.getDescription())
                .website(b.getWebsite())
                .sortOrder(b.getSortOrder())
                .build();
    }
}

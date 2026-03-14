package it.espressamente.api.product.service;

import com.github.slugify.Slugify;
import it.espressamente.api.product.dto.ProductRequest;
import it.espressamente.api.product.dto.BrandResponse;
import it.espressamente.api.product.dto.CategoryResponse;
import it.espressamente.api.product.dto.ProductResponse;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.product.entity.Brand;
import it.espressamente.api.product.entity.Category;
import it.espressamente.api.product.entity.Product;
import it.espressamente.api.product.enums.ProductType;
import it.espressamente.api.product.repository.BrandRepository;
import it.espressamente.api.product.repository.CategoryRepository;
import it.espressamente.api.product.repository.ProductRepository;
import it.espressamente.api.admin.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final AuditService auditService;
    private final Slugify slugify = Slugify.builder().build();

    public Page<ProductResponse> getAll(Pageable pageable) {
        return productRepository.findByIsActiveTrue(pageable).map(this::toResponse);
    }

    public Page<ProductResponse> getByType(ProductType type, Pageable pageable) {
        return productRepository.findByProductTypeAndIsActiveTrue(type, pageable).map(this::toResponse);
    }

    public Page<ProductResponse> getByCategory(String categorySlug, Pageable pageable) {
        return productRepository.findByCategorySlugAndIsActiveTrue(categorySlug, pageable).map(this::toResponse);
    }

    public Page<ProductResponse> getByBrand(String brandSlug, Pageable pageable) {
        return productRepository.findByBrandSlugAndIsActiveTrue(brandSlug, pageable).map(this::toResponse);
    }

    public ProductResponse getBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Prodotto non trovato: " + slug));
    }

    public List<ProductResponse> getFeatured() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<ProductResponse> search(String query, Pageable pageable) {
        return productRepository.search(query, pageable).map(this::toResponse);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        mapRequestToEntity(request, product);
        product.setSlug(slugify.slugify(request.getName()));
        product.setSku(generateSku(request.getProductType()));
        Product saved = productRepository.save(product);
        auditService.log("CREATE", "Product", saved.getId(), "Creato prodotto: " + saved.getName() + " [" + saved.getSku() + "]");
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prodotto non trovato: " + id));
        mapRequestToEntity(request, product);
        Product saved = productRepository.save(product);
        auditService.log("UPDATE", "Product", saved.getId(), "Aggiornato prodotto: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prodotto non trovato: " + id));
        product.setIsActive(false);
        productRepository.save(product);
        auditService.log("DELETE", "Product", id, "Disattivato prodotto: " + product.getName());
    }

    public String generateSku(ProductType type) {
        String prefix = switch (type) {
            case CAFFE -> "CAF";
            case MACCHINA -> "MAC";
            case ACCESSORIO -> "ACC";
        };
        long count = productRepository.countBySkuPrefix(prefix);
        return String.format("%s-%03d", prefix, count + 1);
    }

    // ── Mapping ──

    private void mapRequestToEntity(ProductRequest req, Product product) {
        product.setName(req.getName());
        product.setShortDescription(req.getShortDescription());
        product.setDescription(req.getDescription());
        product.setProductType(req.getProductType());
        product.setPrice(req.getPrice());
        product.setPriceLabel(req.getPriceLabel());
        product.setImages(req.getImages());
        product.setMetaTitle(req.getMetaTitle());
        product.setMetaDescription(req.getMetaDescription());

        if (req.getIsFeatured() != null) product.setIsFeatured(req.getIsFeatured());
        if (req.getIsActive() != null) product.setIsActive(req.getIsActive());
        if (req.getSortOrder() != null) product.setSortOrder(req.getSortOrder());

        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria non trovata"));
            product.setCategory(category);
        }
        if (req.getBrandId() != null) {
            Brand brand = brandRepository.findById(req.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand non trovato"));
            product.setBrand(brand);
        }
        if (req.getFeatures() != null) {
            product.setFeatures(req.getFeatures().stream()
                    .map(f -> new Product.ProductFeature(f.getLabel(), f.getValue()))
                    .collect(Collectors.toList()));
        }
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .slug(p.getSlug())
                .shortDescription(p.getShortDescription())
                .description(p.getDescription())
                .productType(p.getProductType())
                .price(p.getPrice())
                .priceLabel(p.getPriceLabel())
                .images(p.getImages())
                .isFeatured(p.getIsFeatured())
                .metaTitle(p.getMetaTitle())
                .metaDescription(p.getMetaDescription())
                .createdAt(p.getCreatedAt())
                .category(p.getCategory() != null ? CategoryResponse.builder()
                        .id(p.getCategory().getId())
                        .name(p.getCategory().getName())
                        .slug(p.getCategory().getSlug())
                        .build() : null)
                .brand(p.getBrand() != null ? BrandResponse.builder()
                        .id(p.getBrand().getId())
                        .name(p.getBrand().getName())
                        .slug(p.getBrand().getSlug())
                        .logo(p.getBrand().getLogo())
                        .build() : null)
                .features(p.getFeatures() != null ? p.getFeatures().stream()
                        .map(f -> new ProductResponse.FeatureResponse(f.getLabel(), f.getValue()))
                        .collect(Collectors.toList()) : null)
                .build();
    }
}

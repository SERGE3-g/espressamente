package it.espressamente.api.service;

import com.github.slugify.Slugify;
import it.espressamente.api.dto.request.ProductRequest;
import it.espressamente.api.dto.response.BrandResponse;
import it.espressamente.api.dto.response.CategoryResponse;
import it.espressamente.api.dto.response.ProductResponse;
import it.espressamente.api.exception.ResourceNotFoundException;
import it.espressamente.api.model.entity.Brand;
import it.espressamente.api.model.entity.Category;
import it.espressamente.api.model.entity.Product;
import it.espressamente.api.model.enums.ProductType;
import it.espressamente.api.repository.BrandRepository;
import it.espressamente.api.repository.CategoryRepository;
import it.espressamente.api.repository.ProductRepository;
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
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prodotto non trovato: " + id));
        mapRequestToEntity(request, product);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prodotto non trovato: " + id));
        product.setIsActive(false);
        productRepository.save(product);
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

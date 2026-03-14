package it.espressamente.api.product.service;

import com.github.slugify.Slugify;
import it.espressamente.api.product.dto.CategoryRequest;
import it.espressamente.api.product.dto.CategoryResponse;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.product.entity.Category;
import it.espressamente.api.admin.service.AuditService;
import it.espressamente.api.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditService auditService;
    private final Slugify slugify = Slugify.builder().build();

    public List<CategoryResponse> getAll() {
        return categoryRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria non trovata: " + id));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        mapRequestToEntity(request, category);

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? slugify.slugify(request.getSlug())
                : slugify.slugify(request.getName());
        category.setSlug(slug);

        Category saved = categoryRepository.save(category);
        auditService.log("CREATE", "Category", saved.getId(), "Creata categoria: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria non trovata: " + id));
        mapRequestToEntity(request, category);

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            category.setSlug(slugify.slugify(request.getSlug()));
        }

        Category saved = categoryRepository.save(category);
        auditService.log("UPDATE", "Category", saved.getId(), "Aggiornata categoria: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria non trovata: " + id));
        category.setIsActive(false);
        categoryRepository.save(category);
        auditService.log("DELETE", "Category", id, "Disattivata categoria: " + category.getName());
    }

    // ── Mapping ──

    private void mapRequestToEntity(CategoryRequest req, Category category) {
        category.setName(req.getName());
        category.setDescription(req.getDescription());
        if (req.getSortOrder() != null) {
            category.setSortOrder(req.getSortOrder());
        }
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .image(c.getImage())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .sortOrder(c.getSortOrder())
                .build();
    }
}

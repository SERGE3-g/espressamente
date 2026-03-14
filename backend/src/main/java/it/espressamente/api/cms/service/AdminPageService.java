package it.espressamente.api.cms.service;

import com.github.slugify.Slugify;
import it.espressamente.api.cms.dto.PageRequest;
import it.espressamente.api.cms.dto.PageResponse;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.cms.entity.Page;
import it.espressamente.api.admin.service.AuditService;
import it.espressamente.api.cms.repository.PageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPageService {

    private final PageRepository pageRepository;
    private final AuditService auditService;
    private final Slugify slugify = Slugify.builder().build();

    public List<PageResponse> getAll() {
        return pageRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PageResponse getBySlug(String slug) {
        Page page = pageRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Pagina non trovata: " + slug));
        return toResponse(page);
    }

    @Transactional
    public PageResponse create(PageRequest request) {
        Page page = new Page();
        mapRequestToEntity(request, page);

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? slugify.slugify(request.getSlug())
                : slugify.slugify(request.getTitle());
        page.setSlug(slug);

        Page saved = pageRepository.save(page);
        auditService.log("CREATE", "Page", saved.getId(), "Creata pagina: " + saved.getTitle());
        return toResponse(saved);
    }

    public List<PageResponse> search(String query, Boolean published) {
        List<Page> pages;
        if (query == null && published == null) {
            pages = pageRepository.findAllByOrderBySortOrderAsc();
        } else if (query != null && published == null) {
            pages = pageRepository.findByTitleContainingIgnoreCaseOrderBySortOrderAsc(query);
        } else if (query == null) {
            pages = pageRepository.findByIsPublishedOrderBySortOrderAsc(published);
        } else {
            pages = pageRepository.findByIsPublishedAndTitleContainingIgnoreCaseOrderBySortOrderAsc(published, query);
        }
        return pages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PageResponse update(Long id, PageRequest request) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pagina non trovata: " + id));
        mapRequestToEntity(request, page);

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            page.setSlug(slugify.slugify(request.getSlug()));
        }

        Page saved = pageRepository.save(page);
        auditService.log("UPDATE", "Page", saved.getId(), "Aggiornata pagina: " + saved.getTitle());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pagina non trovata: " + id));
        auditService.log("DELETE", "Page", id, "Eliminata pagina: " + page.getTitle());
        pageRepository.delete(page);
    }

    // ── Mapping ──

    private void mapRequestToEntity(PageRequest req, Page page) {
        page.setTitle(req.getTitle());
        page.setContent(req.getContent());
        page.setMetaTitle(req.getMetaTitle());
        page.setMetaDescription(req.getMetaDescription());
        if (req.getIsPublished() != null) {
            page.setIsPublished(req.getIsPublished());
        }
        if (req.getSortOrder() != null) {
            page.setSortOrder(req.getSortOrder());
        }
    }

    private PageResponse toResponse(Page p) {
        return PageResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .slug(p.getSlug())
                .content(p.getContent())
                .metaTitle(p.getMetaTitle())
                .metaDescription(p.getMetaDescription())
                .isPublished(p.getIsPublished())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}

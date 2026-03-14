package it.espressamente.api.cms.controller;

import it.espressamente.api.cms.dto.PageResponse;
import it.espressamente.api.cms.entity.Page;
import it.espressamente.api.cms.repository.PageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PageController {

    private final PageRepository pageRepository;

    @GetMapping("/v1/pages")
    public List<PageResponse> getAll() {
        return pageRepository.findByIsPublishedTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/v1/pages/{slug}")
    public PageResponse getBySlug(@PathVariable String slug) {
        Page page = pageRepository.findBySlug(slug)
                .filter(Page::getIsPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagina non trovata"));
        return toResponse(page);
    }

    private PageResponse toResponse(Page p) {
        return PageResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .slug(p.getSlug())
                .content(p.getContent())
                .metaTitle(p.getMetaTitle())
                .metaDescription(p.getMetaDescription())
                .build();
    }
}

package it.espressamente.api.cms.repository;

import it.espressamente.api.cms.entity.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {

    Optional<Page> findBySlug(String slug);

    List<Page> findByIsPublishedTrueOrderBySortOrderAsc();

    List<Page> findAllByOrderBySortOrderAsc();

    List<Page> findByTitleContainingIgnoreCaseOrderBySortOrderAsc(String title);

    List<Page> findByIsPublishedOrderBySortOrderAsc(boolean isPublished);

    List<Page> findByIsPublishedAndTitleContainingIgnoreCaseOrderBySortOrderAsc(boolean isPublished, String title);
}

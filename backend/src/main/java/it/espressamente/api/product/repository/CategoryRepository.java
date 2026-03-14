package it.espressamente.api.product.repository;

import it.espressamente.api.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();

    List<Category> findByParentIdAndIsActiveTrueOrderBySortOrderAsc(Long parentId);

    List<Category> findByIsActiveTrueOrderBySortOrderAsc();

    List<Category> findAllByOrderBySortOrderAsc();
}

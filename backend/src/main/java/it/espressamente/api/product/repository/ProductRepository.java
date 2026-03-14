package it.espressamente.api.product.repository;

import it.espressamente.api.product.entity.Product;
import it.espressamente.api.product.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    Page<Product> findByIsActiveTrue(Pageable pageable);

    Page<Product> findByProductTypeAndIsActiveTrue(ProductType productType, Pageable pageable);

    Page<Product> findByCategorySlugAndIsActiveTrue(String categorySlug, Pageable pageable);

    Page<Product> findByBrandSlugAndIsActiveTrue(String brandSlug, Pageable pageable);

    List<Product> findByIsFeaturedTrueAndIsActiveTrueOrderBySortOrderAsc();

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.shortDescription) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> search(@Param("query") String query, Pageable pageable);

    long countByIsActiveTrue();

    @Query("SELECT p.name FROM Product p WHERE p.id = :id")
    Optional<String> findNameById(@Param("id") Long id);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.sku LIKE :prefix%")
    long countBySkuPrefix(@Param("prefix") String prefix);
}

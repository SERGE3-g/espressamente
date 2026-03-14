package it.espressamente.api.warehouse.repository;

import it.espressamente.api.warehouse.entity.WarehouseMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface WarehouseMovementRepository extends JpaRepository<WarehouseMovement, Long> {

    @Query("SELECT wm FROM WarehouseMovement wm JOIN FETCH wm.product LEFT JOIN FETCH wm.store ORDER BY wm.createdAt DESC")
    Page<WarehouseMovement> findAllWithProduct(Pageable pageable);

    @Query("SELECT wm FROM WarehouseMovement wm JOIN FETCH wm.product LEFT JOIN FETCH wm.store WHERE wm.product.id = :productId ORDER BY wm.createdAt DESC")
    Page<WarehouseMovement> findByProductId(Long productId, Pageable pageable);
}

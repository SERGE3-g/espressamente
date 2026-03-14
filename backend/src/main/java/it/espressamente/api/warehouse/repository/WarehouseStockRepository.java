package it.espressamente.api.warehouse.repository;

import it.espressamente.api.warehouse.entity.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {

    @Query("SELECT ws FROM WarehouseStock ws JOIN FETCH ws.product LEFT JOIN FETCH ws.store ORDER BY ws.product.name")
    List<WarehouseStock> findAllWithProduct();

    @Query("SELECT ws FROM WarehouseStock ws JOIN FETCH ws.product LEFT JOIN FETCH ws.store WHERE ws.product.id = :productId")
    Optional<WarehouseStock> findByProductId(Long productId);

    @Query("SELECT ws FROM WarehouseStock ws JOIN FETCH ws.product LEFT JOIN FETCH ws.store WHERE ws.quantity <= ws.reorderPoint ORDER BY ws.quantity ASC")
    List<WarehouseStock> findLowStock();
}

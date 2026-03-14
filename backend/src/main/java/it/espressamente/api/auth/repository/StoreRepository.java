package it.espressamente.api.auth.repository;

import it.espressamente.api.auth.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByIsActiveTrueOrderByNameAsc();
}

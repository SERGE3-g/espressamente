package it.espressamente.api.customer.repository;

import it.espressamente.api.customer.entity.CustomerInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerInteractionRepository extends JpaRepository<CustomerInteraction, Long> {

    @Query("SELECT ci FROM CustomerInteraction ci LEFT JOIN FETCH ci.adminUser WHERE ci.customer.id = :customerId ORDER BY ci.date DESC")
    List<CustomerInteraction> findByCustomerIdWithAdmin(@Param("customerId") Long customerId);

    long countByCustomerId(Long customerId);
}

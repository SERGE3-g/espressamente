package it.espressamente.api.customer.repository;

import it.espressamente.api.customer.entity.Customer;
import it.espressamente.api.contact.enums.ClientType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Utilizzati per search in-memory (i campi sono cifrati, LIKE non funziona sul DB)
    List<Customer> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Customer> findByIsActiveTrueAndClientTypeOrderByCreatedAtDesc(ClientType clientType);

    long countByIsActiveTrue();
}

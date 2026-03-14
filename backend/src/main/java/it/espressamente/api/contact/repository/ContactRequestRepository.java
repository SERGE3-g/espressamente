package it.espressamente.api.contact.repository;

import it.espressamente.api.contact.entity.ContactRequest;
import it.espressamente.api.contact.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {

    Page<ContactRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status, Pageable pageable);

    Page<ContactRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(RequestStatus status);

    List<ContactRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    long countByCustomerId(Long customerId);
}

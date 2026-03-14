package it.espressamente.api.contact.repository;

import it.espressamente.api.contact.entity.ServiceRequest;
import it.espressamente.api.contact.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    Page<ServiceRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status, Pageable pageable);

    Page<ServiceRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(RequestStatus status);

    List<ServiceRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    long countByCustomerId(Long customerId);
}

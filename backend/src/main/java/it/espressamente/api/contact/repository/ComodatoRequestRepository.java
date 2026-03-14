package it.espressamente.api.contact.repository;

import it.espressamente.api.contact.entity.ComodatoRequest;
import it.espressamente.api.contact.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComodatoRequestRepository extends JpaRepository<ComodatoRequest, Long> {

    Page<ComodatoRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<ComodatoRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status, Pageable pageable);

    long countByStatus(RequestStatus status);

    List<ComodatoRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    long countByCustomerId(Long customerId);
}

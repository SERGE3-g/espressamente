package it.espressamente.api.repository;

import it.espressamente.api.model.entity.ContactRequest;
import it.espressamente.api.model.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {

    Page<ContactRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status, Pageable pageable);

    Page<ContactRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(RequestStatus status);
}

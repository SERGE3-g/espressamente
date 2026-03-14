package it.espressamente.api.invoice.repository;

import it.espressamente.api.invoice.entity.Invoice;
import it.espressamente.api.invoice.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Page<Invoice> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Invoice> findByStatusOrderByCreatedAtDesc(InvoiceStatus status, Pageable pageable);

    @Query("SELECT i FROM Invoice i LEFT JOIN FETCH i.customer LEFT JOIN FETCH i.items WHERE i.id = :id")
    Optional<Invoice> findByIdWithDetails(Long id);

    @Query(value = "SELECT nextval('invoice_number_seq')", nativeQuery = true)
    Long getNextInvoiceNumber();

    long countByStatus(InvoiceStatus status);

    long countByCustomerId(Long customerId);

    // ── List queries (no pagination, for in-memory filtering + CSV export) ──

    List<Invoice> findAllByOrderByCreatedAtDesc();

    List<Invoice> findByStatusOrderByCreatedAtDesc(InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE i.issueDate BETWEEN :from AND :to ORDER BY i.createdAt DESC")
    List<Invoice> findByIssueDateBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT i FROM Invoice i WHERE i.status = :status AND i.issueDate BETWEEN :from AND :to ORDER BY i.createdAt DESC")
    List<Invoice> findByStatusAndIssueDateBetween(@Param("status") InvoiceStatus status, @Param("from") LocalDate from, @Param("to") LocalDate to);
}

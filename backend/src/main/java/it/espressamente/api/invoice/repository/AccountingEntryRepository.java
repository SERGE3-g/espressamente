package it.espressamente.api.invoice.repository;

import it.espressamente.api.invoice.entity.AccountingEntry;
import it.espressamente.api.invoice.enums.AccountingCategory;
import it.espressamente.api.invoice.enums.AccountingType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccountingEntryRepository extends JpaRepository<AccountingEntry, Long> {

    Page<AccountingEntry> findAllByOrderByDateDesc(Pageable pageable);

    Page<AccountingEntry> findByTypeOrderByDateDesc(AccountingType type, Pageable pageable);

    // ── Filtri avanzati (List per in-memory search + manual pagination) ──

    List<AccountingEntry> findAllByOrderByDateDesc();

    List<AccountingEntry> findByTypeOrderByDateDesc(AccountingType type);

    List<AccountingEntry> findByCategoryOrderByDateDesc(AccountingCategory category);

    List<AccountingEntry> findByTypeAndCategoryOrderByDateDesc(AccountingType type, AccountingCategory category);

    @Query("SELECT e FROM AccountingEntry e WHERE e.date BETWEEN :from AND :to ORDER BY e.date DESC")
    List<AccountingEntry> findByDateBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT e FROM AccountingEntry e WHERE e.type = :type AND e.date BETWEEN :from AND :to ORDER BY e.date DESC")
    List<AccountingEntry> findByTypeAndDateBetween(@Param("type") AccountingType type, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT e FROM AccountingEntry e WHERE e.category = :category AND e.date BETWEEN :from AND :to ORDER BY e.date DESC")
    List<AccountingEntry> findByCategoryAndDateBetween(@Param("category") AccountingCategory category, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT e FROM AccountingEntry e WHERE e.type = :type AND e.category = :category AND e.date BETWEEN :from AND :to ORDER BY e.date DESC")
    List<AccountingEntry> findByTypeAndCategoryAndDateBetween(@Param("type") AccountingType type, @Param("category") AccountingCategory category, @Param("from") LocalDate from, @Param("to") LocalDate to);

    // ── Summary ──

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM AccountingEntry e WHERE e.type = :type AND e.date BETWEEN :from AND :to")
    BigDecimal sumByTypeAndDateBetween(@Param("type") AccountingType type, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM AccountingEntry e WHERE e.type = :type AND e.category = :category AND e.date BETWEEN :from AND :to")
    BigDecimal sumByTypeAndCategoryAndDateBetween(@Param("type") AccountingType type, @Param("category") AccountingCategory category, @Param("from") LocalDate from, @Param("to") LocalDate to);

    boolean existsByInvoiceId(Long invoiceId);
}

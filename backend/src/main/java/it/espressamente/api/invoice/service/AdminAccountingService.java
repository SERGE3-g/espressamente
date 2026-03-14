package it.espressamente.api.invoice.service;

import it.espressamente.api.invoice.dto.AccountingEntryRequest;
import it.espressamente.api.invoice.dto.AccountingEntryResponse;
import it.espressamente.api.invoice.dto.AccountingSummaryResponse;
import it.espressamente.api.invoice.dto.ProfitAndLossResponse;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.invoice.entity.AccountingEntry;
import it.espressamente.api.customer.entity.Customer;
import it.espressamente.api.invoice.entity.Invoice;
import it.espressamente.api.invoice.enums.AccountingCategory;
import it.espressamente.api.invoice.enums.AccountingType;
import it.espressamente.api.invoice.repository.AccountingEntryRepository;
import it.espressamente.api.customer.repository.CustomerRepository;
import it.espressamente.api.invoice.repository.InvoiceRepository;
import it.espressamente.api.admin.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAccountingService {

    private final AccountingEntryRepository accountingRepo;
    private final InvoiceRepository invoiceRepo;
    private final CustomerRepository customerRepo;
    private final AuditService auditService;

    public Page<AccountingEntryResponse> getAll(String type, String category, String search,
                                                 String dateFrom, String dateTo, Pageable pageable) {
        List<AccountingEntry> all = getFilteredEntries(type, category, search, dateFrom, dateTo);

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        List<AccountingEntry> subList = start < all.size() ? all.subList(start, end) : List.<AccountingEntry>of();
        List<AccountingEntryResponse> content = subList.stream().map(this::toResponse).collect(Collectors.toList());

        return new PageImpl<>(content, pageable, all.size());
    }

    public List<AccountingEntry> getFilteredEntries(String type, String category, String search,
                                                     String dateFrom, String dateTo) {
        AccountingType typeEnum = (type != null && !type.isBlank()) ? AccountingType.valueOf(type) : null;
        AccountingCategory catEnum = (category != null && !category.isBlank()) ? AccountingCategory.valueOf(category) : null;
        boolean hasDates = dateFrom != null && !dateFrom.isBlank() && dateTo != null && !dateTo.isBlank();
        LocalDate from = hasDates ? LocalDate.parse(dateFrom) : null;
        LocalDate to = hasDates ? LocalDate.parse(dateTo) : null;

        List<AccountingEntry> results;

        if (typeEnum != null && catEnum != null && hasDates) {
            results = accountingRepo.findByTypeAndCategoryAndDateBetween(typeEnum, catEnum, from, to);
        } else if (typeEnum != null && hasDates) {
            results = accountingRepo.findByTypeAndDateBetween(typeEnum, from, to);
        } else if (catEnum != null && hasDates) {
            results = accountingRepo.findByCategoryAndDateBetween(catEnum, from, to);
        } else if (typeEnum != null && catEnum != null) {
            results = accountingRepo.findByTypeAndCategoryOrderByDateDesc(typeEnum, catEnum);
        } else if (typeEnum != null) {
            results = accountingRepo.findByTypeOrderByDateDesc(typeEnum);
        } else if (catEnum != null) {
            results = accountingRepo.findByCategoryOrderByDateDesc(catEnum);
        } else if (hasDates) {
            results = accountingRepo.findByDateBetween(from, to);
        } else {
            results = accountingRepo.findAllByOrderByDateDesc();
        }

        // Filtro testo in-memory
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            results = results.stream().filter(e ->
                (e.getDescription() != null && e.getDescription().toLowerCase().contains(q))
                || (e.getNotes() != null && e.getNotes().toLowerCase().contains(q))
                || (e.getCustomer() != null && e.getCustomer().getFullName() != null && e.getCustomer().getFullName().toLowerCase().contains(q))
                || (e.getInvoice() != null && e.getInvoice().getInvoiceNumber() != null && e.getInvoice().getInvoiceNumber().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        return results;
    }

    public AccountingEntryResponse getById(Long id) {
        AccountingEntry entry = accountingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registrazione non trovata: " + id));
        return toResponse(entry);
    }

    @Transactional
    public AccountingEntryResponse create(AccountingEntryRequest request) {
        AccountingEntry entry = AccountingEntry.builder()
                .type(AccountingType.valueOf(request.getType()))
                .category(AccountingCategory.valueOf(request.getCategory()))
                .amount(request.getAmount())
                .description(request.getDescription())
                .date(request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now())
                .notes(request.getNotes())
                .build();

        if (request.getInvoiceId() != null) {
            Invoice invoice = invoiceRepo.findById(request.getInvoiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fattura non trovata: " + request.getInvoiceId()));
            entry.setInvoice(invoice);
        }

        if (request.getCustomerId() != null) {
            Customer customer = customerRepo.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente non trovato: " + request.getCustomerId()));
            entry.setCustomer(customer);
        }

        AccountingEntry saved = accountingRepo.save(entry);
        auditService.log("CREATE", "AccountingEntry", saved.getId(), "Creata registrazione: " + saved.getDescription());
        return toResponse(saved);
    }

    @Transactional
    public AccountingEntryResponse update(Long id, AccountingEntryRequest request) {
        AccountingEntry entry = accountingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registrazione non trovata: " + id));

        entry.setType(AccountingType.valueOf(request.getType()));
        entry.setCategory(AccountingCategory.valueOf(request.getCategory()));
        entry.setAmount(request.getAmount());
        entry.setDescription(request.getDescription());
        entry.setDate(request.getDate() != null ? LocalDate.parse(request.getDate()) : entry.getDate());
        entry.setNotes(request.getNotes());

        if (request.getInvoiceId() != null) {
            entry.setInvoice(invoiceRepo.findById(request.getInvoiceId()).orElse(null));
        } else {
            entry.setInvoice(null);
        }

        if (request.getCustomerId() != null) {
            entry.setCustomer(customerRepo.findById(request.getCustomerId()).orElse(null));
        } else {
            entry.setCustomer(null);
        }

        AccountingEntry updated = accountingRepo.save(entry);
        auditService.log("UPDATE", "AccountingEntry", updated.getId(), "Aggiornata registrazione: " + updated.getDescription());
        return toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        AccountingEntry entry = accountingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registrazione non trovata: " + id));
        accountingRepo.delete(entry);
        auditService.log("DELETE", "AccountingEntry", id, "Eliminata registrazione: " + entry.getDescription());
    }

    public AccountingSummaryResponse getSummary(String from, String to, String type, String category) {
        LocalDate dateFrom = from != null && !from.isBlank() ? LocalDate.parse(from) : LocalDate.now().withDayOfYear(1);
        LocalDate dateTo = to != null && !to.isBlank() ? LocalDate.parse(to) : LocalDate.now();

        BigDecimal entrate;
        BigDecimal uscite;

        if (category != null && !category.isBlank()) {
            AccountingCategory catEnum = AccountingCategory.valueOf(category);
            entrate = accountingRepo.sumByTypeAndCategoryAndDateBetween(AccountingType.ENTRATA, catEnum, dateFrom, dateTo);
            uscite = accountingRepo.sumByTypeAndCategoryAndDateBetween(AccountingType.USCITA, catEnum, dateFrom, dateTo);
        } else {
            entrate = accountingRepo.sumByTypeAndDateBetween(AccountingType.ENTRATA, dateFrom, dateTo);
            uscite = accountingRepo.sumByTypeAndDateBetween(AccountingType.USCITA, dateFrom, dateTo);
        }

        return AccountingSummaryResponse.builder()
                .totalEntrate(entrate)
                .totalUscite(uscite)
                .bilancio(entrate.subtract(uscite))
                .periodFrom(dateFrom.toString())
                .periodTo(dateTo.toString())
                .build();
    }

    public ProfitAndLossResponse getProfitAndLoss(String from, String to) {
        LocalDate dateFrom = from != null && !from.isBlank() ? LocalDate.parse(from) : LocalDate.now().withDayOfYear(1);
        LocalDate dateTo = to != null && !to.isBlank() ? LocalDate.parse(to) : LocalDate.now();

        BigDecimal totalEntrate = BigDecimal.ZERO;
        BigDecimal totalUscite = BigDecimal.ZERO;
        List<ProfitAndLossResponse.CategoryBreakdown> categories = new ArrayList<>();

        for (AccountingCategory cat : AccountingCategory.values()) {
            BigDecimal entrate = accountingRepo.sumByTypeAndCategoryAndDateBetween(AccountingType.ENTRATA, cat, dateFrom, dateTo);
            BigDecimal uscite = accountingRepo.sumByTypeAndCategoryAndDateBetween(AccountingType.USCITA, cat, dateFrom, dateTo);

            if (entrate.signum() != 0 || uscite.signum() != 0) {
                categories.add(ProfitAndLossResponse.CategoryBreakdown.builder()
                        .category(cat.name())
                        .entrate(entrate)
                        .uscite(uscite)
                        .netto(entrate.subtract(uscite))
                        .build());
                totalEntrate = totalEntrate.add(entrate);
                totalUscite = totalUscite.add(uscite);
            }
        }

        return ProfitAndLossResponse.builder()
                .categories(categories)
                .totalEntrate(totalEntrate)
                .totalUscite(totalUscite)
                .netResult(totalEntrate.subtract(totalUscite))
                .periodFrom(dateFrom.toString())
                .periodTo(dateTo.toString())
                .build();
    }

    public String exportCsv(String type, String category, String search, String dateFrom, String dateTo) {
        List<AccountingEntry> entries = getFilteredEntries(type, category, search, dateFrom, dateTo);
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF'); // BOM UTF-8
        sb.append("Data,Tipo,Categoria,Descrizione,Importo,Fattura,Cliente,Note\n");

        for (AccountingEntry e : entries) {
            sb.append(e.getDate()).append(',');
            sb.append(e.getType()).append(',');
            sb.append(e.getCategory()).append(',');
            sb.append(csvEscape(e.getDescription())).append(',');
            sb.append(e.getAmount()).append(',');
            sb.append(e.getInvoice() != null ? e.getInvoice().getInvoiceNumber() : "").append(',');
            sb.append(e.getCustomer() != null ? csvEscape(e.getCustomer().getFullName()) : "").append(',');
            sb.append(csvEscape(e.getNotes())).append('\n');
        }

        return sb.toString();
    }

    @Transactional
    public void createFromInvoice(Invoice invoice) {
        if (accountingRepo.existsByInvoiceId(invoice.getId())) return;

        AccountingEntry entry = AccountingEntry.builder()
                .type(AccountingType.ENTRATA)
                .category(AccountingCategory.VENDITA)
                .amount(invoice.getTotal())
                .description("Fattura " + invoice.getInvoiceNumber())
                .date(invoice.getPaidDate() != null ? invoice.getPaidDate() : LocalDate.now())
                .invoice(invoice)
                .customer(invoice.getCustomer())
                .build();

        accountingRepo.save(entry);
    }

    // ── Helpers ──

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private AccountingEntryResponse toResponse(AccountingEntry e) {
        return AccountingEntryResponse.builder()
                .id(e.getId())
                .type(e.getType().name())
                .category(e.getCategory().name())
                .amount(e.getAmount())
                .description(e.getDescription())
                .date(e.getDate())
                .invoiceId(e.getInvoice() != null ? e.getInvoice().getId() : null)
                .invoiceNumber(e.getInvoice() != null ? e.getInvoice().getInvoiceNumber() : null)
                .customerId(e.getCustomer() != null ? e.getCustomer().getId() : null)
                .customerName(e.getCustomer() != null ? e.getCustomer().getFullName() : null)
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

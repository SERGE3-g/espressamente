package it.espressamente.api.invoice.service;

import it.espressamente.api.invoice.dto.InvoiceRequest;
import it.espressamente.api.invoice.dto.InvoiceResponse;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.customer.entity.Customer;
import it.espressamente.api.invoice.entity.Invoice;
import it.espressamente.api.invoice.entity.InvoiceItem;
import it.espressamente.api.product.entity.Product;
import it.espressamente.api.invoice.enums.InvoiceStatus;
import it.espressamente.api.invoice.enums.PaymentMethod;
import it.espressamente.api.customer.repository.CustomerRepository;
import it.espressamente.api.invoice.repository.InvoiceRepository;
import it.espressamente.api.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageImpl;
import it.espressamente.api.notification.service.EmailService;
import it.espressamente.api.admin.service.AuditService;
import it.espressamente.api.warehouse.service.WarehouseService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final AdminAccountingService accountingService;
    private final InvoicePdfService pdfService;
    private final EmailService emailService;
    private final AuditService auditService;
    private final WarehouseService warehouseService;

    public Page<InvoiceResponse> getAll(String status, String search, String dateFrom, String dateTo, Pageable pageable) {
        List<Invoice> all = getFilteredInvoices(status, search, dateFrom, dateTo);

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        List<Invoice> subList = start < all.size() ? all.subList(start, end) : List.of();
        List<InvoiceResponse> responses = subList.stream().map(this::toResponse).collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, all.size());
    }

    public byte[] exportCsv(String status, String search, String dateFrom, String dateTo) {
        List<Invoice> filtered = getFilteredInvoices(status, search, dateFrom, dateTo);

        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF'); // BOM for Excel UTF-8
        sb.append("Numero Fattura,Cliente,Stato,Data Emissione,Data Scadenza,Totale,Metodo Pagamento\n");

        for (Invoice inv : filtered) {
            sb.append(csvEscape(inv.getInvoiceNumber())).append(',');
            sb.append(csvEscape(inv.getCustomer() != null ? inv.getCustomer().getFullName() : "")).append(',');
            sb.append(csvEscape(inv.getStatus().name())).append(',');
            sb.append(csvEscape(inv.getIssueDate().toString())).append(',');
            sb.append(csvEscape(inv.getDueDate() != null ? inv.getDueDate().toString() : "")).append(',');
            sb.append(inv.getTotal()).append(',');
            sb.append(csvEscape(inv.getPaymentMethod() != null ? inv.getPaymentMethod().name() : "")).append('\n');
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // ── Filtering (shared by getAll + exportCsv) ────────────────────────────────

    private List<Invoice> getFilteredInvoices(String status, String search, String dateFrom, String dateTo) {
        boolean hasStatus = status != null && !status.isBlank();
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasDateRange = dateFrom != null && !dateFrom.isBlank() && dateTo != null && !dateTo.isBlank();

        InvoiceStatus statusEnum = hasStatus ? InvoiceStatus.valueOf(status) : null;
        LocalDate from = hasDateRange ? LocalDate.parse(dateFrom) : null;
        LocalDate to = hasDateRange ? LocalDate.parse(dateTo) : null;

        List<Invoice> all;
        if (hasStatus && hasDateRange) {
            all = invoiceRepository.findByStatusAndIssueDateBetween(statusEnum, from, to);
        } else if (hasDateRange) {
            all = invoiceRepository.findByIssueDateBetween(from, to);
        } else if (hasStatus) {
            all = invoiceRepository.findByStatusOrderByCreatedAtDesc(statusEnum);
        } else {
            all = invoiceRepository.findAllByOrderByCreatedAtDesc();
        }

        if (hasSearch) {
            String q = search.toLowerCase();
            all = all.stream().filter(inv -> matchesSearch(inv, q)).collect(Collectors.toList());
        }
        return all;
    }

    private boolean matchesSearch(Invoice inv, String q) {
        if (inv.getInvoiceNumber() != null && inv.getInvoiceNumber().toLowerCase().contains(q)) return true;
        if (inv.getCustomer() != null) {
            Customer c = inv.getCustomer();
            if (c.getFullName() != null && c.getFullName().toLowerCase().contains(q)) return true;
            if (c.getCompanyName() != null && c.getCompanyName().toLowerCase().contains(q)) return true;
        }
        return false;
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    public byte[] generatePdf(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fattura non trovata: " + id));
        return pdfService.generatePdf(invoice);
    }

    public String getPdfFilename(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fattura non trovata: " + id));
        return invoice.getInvoiceNumber() + ".pdf";
    }

    @Transactional
    public void sendInvoiceEmail(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fattura non trovata: " + id));

        if (invoice.getCustomer() == null || invoice.getCustomer().getEmail() == null) {
            throw new IllegalStateException("Il cliente non ha un indirizzo email");
        }

        if (invoice.getStatus() == InvoiceStatus.BOZZA) {
            throw new IllegalStateException("Non puoi inviare per email una fattura in bozza");
        }

        byte[] pdfBytes = pdfService.generatePdf(invoice);
        emailService.sendInvoiceEmail(invoice, pdfBytes);
        auditService.log("EMAIL", "Invoice", id, "Inviata email fattura: " + invoice.getInvoiceNumber());
    }

    public InvoiceResponse getById(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fattura non trovata: " + id));
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {
        Long seq = invoiceRepository.getNextInvoiceNumber();
        String number = String.format("FAT-%d-%04d", Year.now().getValue(), seq);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(number)
                .status(InvoiceStatus.BOZZA)
                .issueDate(request.getIssueDate() != null ? LocalDate.parse(request.getIssueDate()) : LocalDate.now())
                .dueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : null)
                .taxRate(request.getTaxRate())
                .notes(request.getNotes())
                .build();

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente non trovato: " + request.getCustomerId()));
            invoice.setCustomer(customer);
        }

        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            invoice.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        }

        if (request.getItems() != null) {
            for (int i = 0; i < request.getItems().size(); i++) {
                var itemReq = request.getItems().get(i);
                InvoiceItem item = InvoiceItem.builder()
                        .invoice(invoice)
                        .description(itemReq.getDescription())
                        .quantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1)
                        .unitPrice(itemReq.getUnitPrice())
                        .sortOrder(i)
                        .build();
                if (itemReq.getProductId() != null) {
                    Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                    item.setProduct(product);
                }
                item.recalculate();
                invoice.getItems().add(item);
            }
        }

        invoice.recalculate();
        Invoice saved = invoiceRepository.save(invoice);
        auditService.log("CREATE", "Invoice", saved.getId(), "Creata fattura: " + saved.getInvoiceNumber());
        return toResponse(saved);
    }

    @Transactional
    public InvoiceResponse update(Long id, InvoiceRequest request) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fattura non trovata: " + id));

        if (invoice.getStatus() != InvoiceStatus.BOZZA) {
            throw new IllegalStateException("Solo le fatture in bozza possono essere modificate");
        }

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente non trovato: " + request.getCustomerId()));
            invoice.setCustomer(customer);
        } else {
            invoice.setCustomer(null);
        }

        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            invoice.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        }

        invoice.setIssueDate(request.getIssueDate() != null ? LocalDate.parse(request.getIssueDate()) : invoice.getIssueDate());
        invoice.setDueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : null);
        invoice.setTaxRate(request.getTaxRate());
        invoice.setNotes(request.getNotes());

        // Replace items
        invoice.getItems().clear();
        if (request.getItems() != null) {
            for (int i = 0; i < request.getItems().size(); i++) {
                var itemReq = request.getItems().get(i);
                InvoiceItem item = InvoiceItem.builder()
                        .invoice(invoice)
                        .description(itemReq.getDescription())
                        .quantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1)
                        .unitPrice(itemReq.getUnitPrice())
                        .sortOrder(i)
                        .build();
                if (itemReq.getProductId() != null) {
                    item.setProduct(productRepository.findById(itemReq.getProductId()).orElse(null));
                }
                item.recalculate();
                invoice.getItems().add(item);
            }
        }

        invoice.recalculate();
        Invoice updated = invoiceRepository.save(invoice);
        auditService.log("UPDATE", "Invoice", updated.getId(), "Aggiornata fattura: " + updated.getInvoiceNumber());
        return toResponse(updated);
    }

    @Transactional
    public InvoiceResponse updateStatus(Long id, String newStatus) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fattura non trovata: " + id));

        InvoiceStatus status = InvoiceStatus.valueOf(newStatus);
        invoice.setStatus(status);

        if (status == InvoiceStatus.PAGATA && invoice.getPaidDate() == null) {
            invoice.setPaidDate(LocalDate.now());
        }

        Invoice saved = invoiceRepository.save(invoice);

        // Auto-create accounting entry and deduct stock when paid
        if (status == InvoiceStatus.PAGATA) {
            accountingService.createFromInvoice(saved);
            warehouseService.deductForInvoice(saved);
        }

        auditService.log("STATUS_CHANGE", "Invoice", saved.getId(), "Fattura " + saved.getInvoiceNumber() + " → " + status);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fattura non trovata: " + id));
        if (invoice.getStatus() != InvoiceStatus.BOZZA) {
            throw new IllegalStateException("Solo le fatture in bozza possono essere eliminate");
        }
        invoiceRepository.delete(invoice);
        auditService.log("DELETE", "Invoice", id, "Eliminata fattura: " + invoice.getInvoiceNumber());
    }

    // ── Mapping ─────────────────────────────────────────────────────────────────

    private InvoiceResponse toResponse(Invoice inv) {
        InvoiceResponse.CustomerSummary customerSummary = null;
        if (inv.getCustomer() != null) {
            Customer c = inv.getCustomer();
            customerSummary = InvoiceResponse.CustomerSummary.builder()
                    .id(c.getId())
                    .fullName(c.getFullName())
                    .email(c.getEmail())
                    .companyName(c.getCompanyName())
                    .vatNumber(c.getVatNumber())
                    .build();
        }

        return InvoiceResponse.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .status(inv.getStatus().name())
                .paymentMethod(inv.getPaymentMethod() != null ? inv.getPaymentMethod().name() : null)
                .issueDate(inv.getIssueDate())
                .dueDate(inv.getDueDate())
                .paidDate(inv.getPaidDate())
                .subtotal(inv.getSubtotal())
                .taxRate(inv.getTaxRate())
                .taxAmount(inv.getTaxAmount())
                .total(inv.getTotal())
                .notes(inv.getNotes())
                .customer(customerSummary)
                .items(inv.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()))
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }

    private InvoiceResponse.InvoiceItemResponse toItemResponse(InvoiceItem item) {
        return InvoiceResponse.InvoiceItemResponse.builder()
                .id(item.getId())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .total(item.getTotal())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .build();
    }
}

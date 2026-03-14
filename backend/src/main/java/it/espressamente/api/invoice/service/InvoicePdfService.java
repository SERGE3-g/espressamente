package it.espressamente.api.invoice.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import it.espressamente.api.customer.entity.Customer;
import it.espressamente.api.invoice.entity.Invoice;
import it.espressamente.api.invoice.entity.InvoiceItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import it.espressamente.api.product.entity.Brand;

@Service
@Slf4j
public class InvoicePdfService {

    @Value("${app.company.name:Espressamente Coffee}")
    private String companyName;

    @Value("${app.company.address:}")
    private String companyAddress;

    @Value("${app.company.vat-number:}")
    private String companyVat;

    @Value("${app.company.fiscal-code:}")
    private String companyFiscalCode;

    @Value("${app.company.sdi:}")
    private String companySdi;

    @Value("${app.company.phone:}")
    private String companyPhone;

    @Value("${app.company.mobile:}")
    private String companyMobile;

    @Value("${app.company.email:}")
    private String companyEmail;

    @Value("${app.company.pec:}")
    private String companyPec;

    @Value("${app.company.website:}")
    private String companyWebsite;

    @Value("${app.company.logo-path:classpath:static/logo.png}")
    private String logoPath;

    private final ResourceLoader resourceLoader;

    public InvoicePdfService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    private static final Color BRAND_COLOR = new Color(93, 64, 55);
    private static final Color BRAND_LIGHT = new Color(141, 110, 99);
    private static final Color LIGHT_GRAY = new Color(248, 248, 248);
    private static final Color BORDER_COLOR = new Color(220, 220, 220);
    private static final Color TEXT_COLOR = new Color(51, 51, 51);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final NumberFormat CURRENCY_FMT = NumberFormat.getCurrencyInstance(Locale.ITALY);

    public byte[] generatePdf(Invoice invoice) {
        try {
            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            document.open();

            addHeader(document);
            addInvoiceTitle(document, invoice);
            addTwoColumnBlock(document, invoice);
            addItemsTable(document, invoice);
            addTotals(document, invoice);
            addNotes(document, invoice);
            addPaymentInfo(document, invoice);
            addFooter(document);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Errore generazione PDF fattura {}: {}", invoice.getInvoiceNumber(), e.getMessage());
            throw new RuntimeException("Errore nella generazione del PDF: " + e.getMessage());
        }
    }

    // ── Header: logo + company info ──────────────────────────────────────────────

    private void addHeader(Document doc) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{35, 65});
        headerTable.setSpacingAfter(5);

        // Left: logo or company name
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorderWidth(0);
        logoCell.setPaddingBottom(10);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Image logoImage = loadLogo();
        if (logoImage != null) {
            logoImage.scaleToFit(160, 60);
            logoCell.addElement(logoImage);
        } else {
            Font logoFont = new Font(Font.HELVETICA, 24, Font.BOLD, BRAND_COLOR);
            logoCell.addElement(new Paragraph(companyName, logoFont));
        }
        headerTable.addCell(logoCell);

        // Right: company details
        PdfPCell detailsCell = new PdfPCell();
        detailsCell.setBorderWidth(0);
        detailsCell.setPaddingBottom(10);
        detailsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Font companyFont = new Font(Font.HELVETICA, 10, Font.BOLD, BRAND_COLOR);
        Font detailFont = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.GRAY);

        if (logoImage != null) {
            Paragraph namePar = new Paragraph(companyName, companyFont);
            namePar.setAlignment(Element.ALIGN_RIGHT);
            detailsCell.addElement(namePar);
        }

        addDetailLine(detailsCell, companyAddress, detailFont);
        if (!companyPhone.isBlank()) addDetailLine(detailsCell, "Tel: " + companyPhone, detailFont);
        if (!companyMobile.isBlank()) addDetailLine(detailsCell, "Cell: " + companyMobile, detailFont);
        if (!companyEmail.isBlank()) addDetailLine(detailsCell, companyEmail, detailFont);
        if (!companyPec.isBlank()) addDetailLine(detailsCell, "PEC: " + companyPec, detailFont);
        if (!companyWebsite.isBlank()) addDetailLine(detailsCell, companyWebsite, detailFont);
        if (!companyVat.isBlank()) addDetailLine(detailsCell, "P.IVA: " + companyVat, detailFont);
        if (!companyFiscalCode.isBlank()) addDetailLine(detailsCell, "C.F.: " + companyFiscalCode, detailFont);
        if (!companySdi.isBlank()) addDetailLine(detailsCell, "SDI: " + companySdi, detailFont);

        headerTable.addCell(detailsCell);
        doc.add(headerTable);

        // Brand separator line
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        line.setSpacingAfter(15);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorderWidth(0);
        lineCell.setBorderWidthBottom(2);
        lineCell.setBorderColorBottom(BRAND_COLOR);
        lineCell.setFixedHeight(3);
        line.addCell(lineCell);
        doc.add(line);
    }

    private void addDetailLine(PdfPCell cell, String text, Font font) {
        if (text == null || text.isBlank()) return;
        Paragraph p = new Paragraph(text, font);
        p.setAlignment(Element.ALIGN_RIGHT);
        p.setSpacingBefore(1);
        cell.addElement(p);
    }

    // ── Invoice title band ───────────────────────────────────────────────────────

    private void addInvoiceTitle(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable titleTable = new PdfPTable(2);
        titleTable.setWidthPercentage(100);
        titleTable.setWidths(new float[]{50, 50});
        titleTable.setSpacingAfter(15);

        // Left: "FATTURA" + number
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorderWidth(0);
        leftCell.setBackgroundColor(BRAND_COLOR);
        leftCell.setPadding(12);

        Font labelFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(200, 180, 170));
        Font numFont = new Font(Font.HELVETICA, 16, Font.BOLD, Color.WHITE);

        Paragraph lbl = new Paragraph("FATTURA N.", labelFont);
        leftCell.addElement(lbl);
        Paragraph num = new Paragraph(invoice.getInvoiceNumber(), numFont);
        leftCell.addElement(num);
        titleTable.addCell(leftCell);

        // Right: dates
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorderWidth(0);
        rightCell.setBackgroundColor(BRAND_COLOR);
        rightCell.setPadding(12);

        Font dateLabel = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(200, 180, 170));
        Font dateValue = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);

        Paragraph issueLabel = new Paragraph("Data emissione", dateLabel);
        issueLabel.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(issueLabel);
        Paragraph issueVal = new Paragraph(invoice.getIssueDate().format(DATE_FMT), dateValue);
        issueVal.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(issueVal);

        if (invoice.getDueDate() != null) {
            Paragraph dueLabel = new Paragraph("Scadenza", dateLabel);
            dueLabel.setAlignment(Element.ALIGN_RIGHT);
            dueLabel.setSpacingBefore(4);
            rightCell.addElement(dueLabel);
            Paragraph dueVal = new Paragraph(invoice.getDueDate().format(DATE_FMT), dateValue);
            dueVal.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(dueVal);
        }
        titleTable.addCell(rightCell);
        doc.add(titleTable);
    }

    // ── Two-column: customer + invoice meta ──────────────────────────────────────

    private void addTwoColumnBlock(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{55, 45});
        table.setSpacingAfter(20);

        // Left: customer
        PdfPCell customerCell = new PdfPCell();
        customerCell.setBorderWidth(1);
        customerCell.setBorderColor(BORDER_COLOR);
        customerCell.setPadding(12);

        Font sectionFont = new Font(Font.HELVETICA, 8, Font.BOLD, BRAND_COLOR);
        Font nameFont = new Font(Font.HELVETICA, 11, Font.BOLD, TEXT_COLOR);
        Font normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL, TEXT_COLOR);

        customerCell.addElement(new Paragraph("DESTINATARIO", sectionFont));

        Customer customer = invoice.getCustomer();
        if (customer != null) {
            Paragraph namePar = new Paragraph(
                    customer.getFullName() != null ? customer.getFullName() : "", nameFont);
            namePar.setSpacingBefore(4);
            customerCell.addElement(namePar);

            if (customer.getCompanyName() != null && !customer.getCompanyName().isBlank()) {
                customerCell.addElement(new Paragraph(customer.getCompanyName(), normalFont));
            }

            // Address
            StringBuilder addr = new StringBuilder();
            if (customer.getAddress() != null && !customer.getAddress().isBlank()) addr.append(customer.getAddress());
            if (customer.getCap() != null && !customer.getCap().isBlank()) {
                if (addr.length() > 0) addr.append(", ");
                addr.append(customer.getCap());
            }
            if (customer.getCity() != null && !customer.getCity().isBlank()) {
                if (addr.length() > 0) addr.append(" ");
                addr.append(customer.getCity());
            }
            if (customer.getProvince() != null && !customer.getProvince().isBlank()) {
                addr.append(" (").append(customer.getProvince()).append(")");
            }
            if (addr.length() > 0) {
                customerCell.addElement(new Paragraph(addr.toString(), normalFont));
            }

            if (customer.getVatNumber() != null && !customer.getVatNumber().isBlank()) {
                customerCell.addElement(new Paragraph("P.IVA: " + customer.getVatNumber(), normalFont));
            }
            if (customer.getFiscalCode() != null && !customer.getFiscalCode().isBlank()) {
                customerCell.addElement(new Paragraph("C.F.: " + customer.getFiscalCode(), normalFont));
            }
            if (customer.getEmail() != null && !customer.getEmail().isBlank()) {
                Paragraph emailPar = new Paragraph(customer.getEmail(), normalFont);
                emailPar.setSpacingBefore(4);
                customerCell.addElement(emailPar);
            }
        } else {
            customerCell.addElement(new Paragraph("—", normalFont));
        }
        table.addCell(customerCell);

        // Right: payment info summary
        PdfPCell metaCell = new PdfPCell();
        metaCell.setBorderWidth(1);
        metaCell.setBorderColor(BORDER_COLOR);
        metaCell.setPadding(12);
        metaCell.setBackgroundColor(LIGHT_GRAY);

        metaCell.addElement(new Paragraph("DETTAGLI FATTURA", sectionFont));

        Font metaLabel = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.GRAY);
        Font metaValue = new Font(Font.HELVETICA, 9, Font.BOLD, TEXT_COLOR);

        addMetaRow(metaCell, "Stato", translateStatus(invoice.getStatus().name()), metaLabel, metaValue);
        addMetaRow(metaCell, "Metodo di pagamento",
                invoice.getPaymentMethod() != null ? translatePayment(invoice.getPaymentMethod().name()) : "—",
                metaLabel, metaValue);
        if (invoice.getPaidDate() != null) {
            addMetaRow(metaCell, "Data pagamento", invoice.getPaidDate().format(DATE_FMT), metaLabel, metaValue);
        }

        table.addCell(metaCell);
        doc.add(table);
    }

    private void addMetaRow(PdfPCell cell, String label, String value, Font labelFont, Font valueFont) {
        Paragraph lbl = new Paragraph(label, labelFont);
        lbl.setSpacingBefore(6);
        cell.addElement(lbl);
        cell.addElement(new Paragraph(value, valueFont));
    }

    // ── Items table ──────────────────────────────────────────────────────────────

    private void addItemsTable(Document doc, Invoice invoice) throws DocumentException {
        Font headerFont = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);
        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, TEXT_COLOR);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{5, 45, 10, 20, 20});
        table.setSpacingAfter(5);

        // Header row
        String[] headers = {"#", "Descrizione", "Qtà", "Prezzo Unitario", "Totale"};
        int[] aligns = {Element.ALIGN_CENTER, Element.ALIGN_LEFT, Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT};
        for (int i = 0; i < headers.length; i++) {
            PdfPCell hCell = new PdfPCell(new Phrase(headers[i], headerFont));
            hCell.setBackgroundColor(BRAND_COLOR);
            hCell.setPadding(8);
            hCell.setHorizontalAlignment(aligns[i]);
            hCell.setBorderWidth(0);
            table.addCell(hCell);
        }

        // Data rows
        int row = 1;
        for (InvoiceItem item : invoice.getItems()) {
            Color bg = (row % 2 == 0) ? LIGHT_GRAY : Color.WHITE;

            addItemCell(table, String.valueOf(row), cellFont, bg, Element.ALIGN_CENTER);
            addItemCell(table, item.getDescription(), cellFont, bg, Element.ALIGN_LEFT);
            addItemCell(table, String.valueOf(item.getQuantity()), cellFont, bg, Element.ALIGN_CENTER);
            addItemCell(table, formatCurrency(item.getUnitPrice()), cellFont, bg, Element.ALIGN_RIGHT);
            addItemCell(table, formatCurrency(item.getTotal()), cellFont, bg, Element.ALIGN_RIGHT);

            row++;
        }

        doc.add(table);
    }

    private void addItemCell(PdfPTable table, String text, Font font, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(7);
        cell.setHorizontalAlignment(align);
        cell.setBackgroundColor(bg);
        cell.setBorderWidth(0);
        cell.setBorderWidthBottom(0.5f);
        cell.setBorderColorBottom(BORDER_COLOR);
        table.addCell(cell);
    }

    // ── Totals ───────────────────────────────────────────────────────────────────

    private void addTotals(Document doc, Invoice invoice) throws DocumentException {
        Font labelFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.GRAY);
        Font valueFont = new Font(Font.HELVETICA, 9, Font.NORMAL, TEXT_COLOR);
        Font totalLabelFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);
        Font totalValueFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);

        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(40);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.setSpacingBefore(5);
        totalsTable.setSpacingAfter(20);

        // Subtotal
        addTotalRow(totalsTable, "Imponibile", formatCurrency(invoice.getSubtotal()), labelFont, valueFont, null);

        // Tax
        addTotalRow(totalsTable, "IVA (" + invoice.getTaxRate().stripTrailingZeros().toPlainString() + "%)",
                formatCurrency(invoice.getTaxAmount()), labelFont, valueFont, null);

        // Total row with brand background
        PdfPCell totalLblCell = new PdfPCell(new Phrase("TOTALE", totalLabelFont));
        totalLblCell.setBorderWidth(0);
        totalLblCell.setPadding(8);
        totalLblCell.setBackgroundColor(BRAND_COLOR);
        totalLblCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        totalsTable.addCell(totalLblCell);

        PdfPCell totalValCell = new PdfPCell(new Phrase(formatCurrency(invoice.getTotal()), totalValueFont));
        totalValCell.setBorderWidth(0);
        totalValCell.setPadding(8);
        totalValCell.setBackgroundColor(BRAND_COLOR);
        totalValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.addCell(totalValCell);

        doc.add(totalsTable);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont, Color bg) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, labelFont));
        lCell.setBorderWidth(0);
        lCell.setPadding(5);
        lCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        if (bg != null) lCell.setBackgroundColor(bg);
        table.addCell(lCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value, valueFont));
        vCell.setBorderWidth(0);
        vCell.setPadding(5);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        if (bg != null) vCell.setBackgroundColor(bg);
        table.addCell(vCell);
    }

    // ── Notes ────────────────────────────────────────────────────────────────────

    private void addNotes(Document doc, Invoice invoice) throws DocumentException {
        if (invoice.getNotes() == null || invoice.getNotes().isBlank()) return;

        Font sectionFont = new Font(Font.HELVETICA, 9, Font.BOLD, BRAND_COLOR);
        Font noteFont = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.DARK_GRAY);

        Paragraph header = new Paragraph("NOTE", sectionFont);
        doc.add(header);

        PdfPTable noteTable = new PdfPTable(1);
        noteTable.setWidthPercentage(100);
        noteTable.setSpacingAfter(15);

        PdfPCell cell = new PdfPCell(new Phrase(invoice.getNotes(), noteFont));
        cell.setPadding(10);
        cell.setBackgroundColor(LIGHT_GRAY);
        cell.setBorderWidth(0.5f);
        cell.setBorderColor(BORDER_COLOR);
        noteTable.addCell(cell);

        doc.add(noteTable);
    }

    // ── Payment info ─────────────────────────────────────────────────────────────

    private void addPaymentInfo(Document doc, Invoice invoice) throws DocumentException {
        Font sectionFont = new Font(Font.HELVETICA, 9, Font.BOLD, BRAND_COLOR);
        Font infoFont = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.DARK_GRAY);

        Paragraph header = new Paragraph("MODALITA' DI PAGAMENTO", sectionFont);
        header.setSpacingBefore(5);
        doc.add(header);

        PdfPTable payTable = new PdfPTable(1);
        payTable.setWidthPercentage(100);
        payTable.setSpacingAfter(15);

        PdfPCell cell = new PdfPCell();
        cell.setPadding(10);
        cell.setBackgroundColor(LIGHT_GRAY);
        cell.setBorderWidth(0.5f);
        cell.setBorderColor(BORDER_COLOR);

        String method = invoice.getPaymentMethod() != null ? translatePayment(invoice.getPaymentMethod().name()) : "Da concordare";
        cell.addElement(new Paragraph(method, new Font(Font.HELVETICA, 9, Font.BOLD, TEXT_COLOR)));
        cell.addElement(new Paragraph(
                "Per qualsiasi informazione: " + companyEmail + (companyPhone.isBlank() ? "" : " | Tel: " + companyPhone),
                infoFont));

        payTable.addCell(cell);
        doc.add(payTable);
    }

    // ── Footer ───────────────────────────────────────────────────────────────────

    private void addFooter(Document doc) throws DocumentException {
        // Thin separator
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorderWidth(0);
        lineCell.setBorderWidthTop(0.5f);
        lineCell.setBorderColorTop(BORDER_COLOR);
        lineCell.setFixedHeight(2);
        line.addCell(lineCell);
        doc.add(line);

        Font footerFont = new Font(Font.HELVETICA, 7, Font.NORMAL, Color.GRAY);

        StringBuilder sb = new StringBuilder();
        sb.append(companyName);
        if (!companyAddress.isBlank()) sb.append("  |  ").append(companyAddress);
        if (!companyVat.isBlank()) sb.append("  |  P.IVA: ").append(companyVat);
        if (!companySdi.isBlank()) sb.append("  |  SDI: ").append(companySdi);

        Paragraph footerLine1 = new Paragraph(sb.toString(), footerFont);
        footerLine1.setAlignment(Element.ALIGN_CENTER);
        footerLine1.setSpacingBefore(8);
        doc.add(footerLine1);

        StringBuilder sb2 = new StringBuilder();
        if (!companyPhone.isBlank()) sb2.append("Tel: ").append(companyPhone);
        if (!companyEmail.isBlank()) {
            if (sb2.length() > 0) sb2.append("  |  ");
            sb2.append(companyEmail);
        }
        if (!companyWebsite.isBlank()) {
            if (sb2.length() > 0) sb2.append("  |  ");
            sb2.append(companyWebsite);
        }

        if (sb2.length() > 0) {
            Paragraph footerLine2 = new Paragraph(sb2.toString(), footerFont);
            footerLine2.setAlignment(Element.ALIGN_CENTER);
            footerLine2.setSpacingBefore(2);
            doc.add(footerLine2);
        }

        Font genFont = new Font(Font.HELVETICA, 7, Font.ITALIC, new Color(180, 180, 180));
        Paragraph gen = new Paragraph("Documento generato automaticamente", genFont);
        gen.setAlignment(Element.ALIGN_CENTER);
        gen.setSpacingBefore(8);
        doc.add(gen);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private Image loadLogo() {
        try {
            Resource resource = resourceLoader.getResource(logoPath);
            if (resource.exists()) {
                byte[] bytes = resource.getInputStream().readAllBytes();
                return Image.getInstance(bytes);
            }
        } catch (Exception e) {
            log.debug("Logo non trovato in {}, uso solo testo", logoPath);
        }
        return null;
    }

    private String translateStatus(String status) {
        return switch (status) {
            case "BOZZA" -> "Bozza";
            case "INVIATA" -> "Inviata";
            case "PAGATA" -> "Pagata";
            case "SCADUTA" -> "Scaduta";
            case "ANNULLATA" -> "Annullata";
            default -> status;
        };
    }

    private String translatePayment(String method) {
        return switch (method) {
            case "CONTANTI" -> "Contanti";
            case "BONIFICO" -> "Bonifico Bancario";
            case "CARTA" -> "Carta di Credito/Debito";
            case "ASSEGNO" -> "Assegno";
            case "PAYPAL" -> "PayPal";
            case "ALTRO" -> "Altro";
            default -> method;
        };
    }

    private String formatCurrency(BigDecimal amount) {
        return CURRENCY_FMT.format(amount);
    }
}

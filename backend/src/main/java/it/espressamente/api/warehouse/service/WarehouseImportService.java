package it.espressamente.api.warehouse.service;

import com.github.slugify.Slugify;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import it.espressamente.api.admin.service.AuditService;
import it.espressamente.api.product.entity.Product;
import it.espressamente.api.product.enums.ProductType;
import it.espressamente.api.product.repository.ProductRepository;
import it.espressamente.api.product.service.ProductService;
import it.espressamente.api.warehouse.dto.ImportResult;
import it.espressamente.api.warehouse.entity.WarehouseMovement;
import it.espressamente.api.warehouse.entity.WarehouseStock;
import it.espressamente.api.warehouse.enums.MovementType;
import it.espressamente.api.warehouse.repository.WarehouseMovementRepository;
import it.espressamente.api.warehouse.repository.WarehouseStockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseImportService {

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final WarehouseStockRepository stockRepository;
    private final WarehouseMovementRepository movementRepository;
    private final AuditService auditService;
    private final Slugify slugify = Slugify.builder().build();

    // Expected columns: sku, name, type, price, quantity, reorderPoint
    private static final List<String> EXPECTED_HEADERS = List.of("sku", "name", "type", "price", "quantity");

    @Transactional
    public ImportResult importFile(MultipartFile file, String adminUsername) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) throw new IllegalArgumentException("Nome file mancante");

        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

        List<Map<String, String>> rows;
        switch (ext) {
            case "csv" -> rows = parseCsv(file.getInputStream());
            case "xlsx" -> rows = parseXlsx(file.getInputStream());
            default -> throw new IllegalArgumentException(
                    "Formato non supportato: " + ext + ". Usa CSV (.csv) o Excel (.xlsx)");
        }

        return processRows(rows, adminUsername);
    }

    private List<Map<String, String>> parseCsv(InputStream input) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        try (CSVReader reader = new CSVReaderBuilder(new InputStreamReader(input)).build()) {
            String[] headerLine = reader.readNext();
            if (headerLine == null) throw new IllegalArgumentException("File CSV vuoto");

            String[] headers = normalizeHeaders(headerLine);
            validateHeaders(headers);

            String[] line;
            while ((line = reader.readNext()) != null) {
                Map<String, String> row = new LinkedHashMap<>();
                for (int i = 0; i < headers.length && i < line.length; i++) {
                    row.put(headers[i], line[i].trim());
                }
                rows.add(row);
            }
        } catch (com.opencsv.exceptions.CsvValidationException e) {
            throw new IllegalArgumentException("Errore parsing CSV: " + e.getMessage());
        }
        return rows;
    }

    private List<Map<String, String>> parseXlsx(InputStream input) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(input)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) throw new IllegalArgumentException("Foglio Excel vuoto");

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) throw new IllegalArgumentException("Riga intestazione mancante");

            String[] headers = new String[headerRow.getLastCellNum()];
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                headers[i] = cell != null ? getCellString(cell).trim().toLowerCase() : "";
            }
            headers = normalizeHeaders(headers);
            validateHeaders(headers);

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                Map<String, String> rowMap = new LinkedHashMap<>();
                boolean hasData = false;
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = row.getCell(i);
                    String value = cell != null ? getCellString(cell).trim() : "";
                    rowMap.put(headers[i], value);
                    if (!value.isEmpty()) hasData = true;
                }
                if (hasData) rows.add(rowMap);
            }
        }
        return rows;
    }

    private ImportResult processRows(List<Map<String, String>> rows, String adminUsername) {
        ImportResult result = ImportResult.builder().totalRows(rows.size()).build();

        for (int i = 0; i < rows.size(); i++) {
            int rowNum = i + 2; // +1 header, +1 zero-based
            Map<String, String> row = rows.get(i);
            try {
                processRow(row, rowNum, adminUsername, result);
            } catch (Exception e) {
                result.getErrors().add("Riga " + rowNum + ": " + e.getMessage());
                result.setSkipped(result.getSkipped() + 1);
            }
        }

        auditService.log("IMPORT", "Warehouse", null,
                "Import completato: " + result.getCreated() + " creati, " + result.getUpdated() + " aggiornati, " + result.getSkipped() + " saltati");

        return result;
    }

    private void processRow(Map<String, String> row, int rowNum, String adminUsername, ImportResult result) {
        String sku = row.getOrDefault("sku", "").trim();
        String name = row.getOrDefault("name", "").trim();
        String type = row.getOrDefault("type", "").trim().toUpperCase();
        String priceStr = row.getOrDefault("price", "").trim();
        String quantityStr = row.getOrDefault("quantity", "").trim();
        String reorderStr = row.getOrDefault("reorderpoint", row.getOrDefault("reorder_point", "")).trim();

        if (name.isEmpty()) {
            throw new IllegalArgumentException("Nome prodotto obbligatorio");
        }

        // Parse type
        ProductType productType;
        try {
            productType = type.isEmpty() ? ProductType.CAFFE : ProductType.valueOf(type);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo prodotto non valido: " + type + " (usa CAFFE, MACCHINA, ACCESSORIO)");
        }

        // Parse price
        BigDecimal price = null;
        if (!priceStr.isEmpty()) {
            try {
                price = new BigDecimal(priceStr.replace(",", "."));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Prezzo non valido: " + priceStr);
            }
        }

        // Parse quantity
        int quantity = 0;
        if (!quantityStr.isEmpty()) {
            try {
                quantity = Integer.parseInt(quantityStr);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Quantità non valida: " + quantityStr);
            }
        }

        // Parse reorder point
        int reorderPoint = 5;
        if (!reorderStr.isEmpty()) {
            try {
                reorderPoint = Integer.parseInt(reorderStr);
            } catch (NumberFormatException e) { /* keep default */ }
        }

        // Find or create product
        boolean isNew = false;
        Product product = null;

        // Try to find by SKU first
        if (!sku.isEmpty()) {
            product = productRepository.findBySku(sku).orElse(null);
        }

        // Fallback: find by name/slug
        if (product == null) {
            String slug = slugify.slugify(name);
            product = productRepository.findBySlug(slug).orElse(null);
        }

        if (product == null) {
            // Create new product with auto-generated SKU
            String generatedSku = sku.isEmpty() ? productService.generateSku(productType) : sku;
            product = Product.builder()
                    .sku(generatedSku)
                    .name(name)
                    .slug(slugify.slugify(name))
                    .productType(productType)
                    .price(price)
                    .isActive(true)
                    .isFeatured(false)
                    .sortOrder(0)
                    .build();
            product = productRepository.save(product);
            isNew = true;
            result.setCreated(result.getCreated() + 1);
        } else {
            // Auto-assign SKU to existing products that don't have one
            if (product.getSku() == null || product.getSku().isEmpty()) {
                product.setSku(sku.isEmpty() ? productService.generateSku(product.getProductType()) : sku);
                productRepository.save(product);
            }
            result.setUpdated(result.getUpdated() + 1);
        }

        // Update/create warehouse stock
        if (quantity > 0) {
            final Product finalProduct = product;
            final int finalReorderPoint = reorderPoint;
            WarehouseStock stock = stockRepository.findByProductId(product.getId())
                    .orElseGet(() -> WarehouseStock.builder()
                            .product(finalProduct)
                            .quantity(0)
                            .reorderPoint(finalReorderPoint)
                            .build());

            int previousStock = stock.getQuantity();
            int newStock = previousStock + quantity;

            stock.setQuantity(newStock);
            stock.setReorderPoint(reorderPoint);
            stockRepository.save(stock);

            // Record movement
            WarehouseMovement movement = WarehouseMovement.builder()
                    .product(product)
                    .movementType(MovementType.CARICO)
                    .quantity(quantity)
                    .previousStock(previousStock)
                    .newStock(newStock)
                    .notes("Import da file")
                    .adminUsername(adminUsername)
                    .build();
            movementRepository.save(movement);
        }
    }

    private String[] normalizeHeaders(String[] headers) {
        return Arrays.stream(headers)
                .map(h -> h.trim().toLowerCase()
                        .replace(" ", "")
                        .replace("_", "")
                        .replace("codice", "sku")
                        .replace("nome", "name")
                        .replace("tipo", "type")
                        .replace("prezzo", "price")
                        .replace("quantità", "quantity")
                        .replace("quantita", "quantity")
                        .replace("giacenza", "quantity")
                        .replace("soglia", "reorderpoint")
                )
                .toArray(String[]::new);
    }

    private void validateHeaders(String[] headers) {
        Set<String> found = new HashSet<>(Arrays.asList(headers));
        if (!found.contains("name") && !found.contains("sku")) {
            throw new IllegalArgumentException(
                    "Colonne richieste: almeno 'name' o 'sku'. Trovate: " + Arrays.toString(headers));
        }
    }

    private String getCellString(Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val) && !Double.isInfinite(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield cell.getStringCellValue();
                } catch (Exception e) {
                    yield String.valueOf(cell.getNumericCellValue());
                }
            }
            default -> "";
        };
    }
}

package it.espressamente.api.warehouse.service;

import it.espressamente.api.admin.service.AuditService;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.invoice.entity.Invoice;
import it.espressamente.api.invoice.entity.InvoiceItem;
import it.espressamente.api.product.entity.Product;
import it.espressamente.api.product.repository.ProductRepository;
import it.espressamente.api.warehouse.dto.StockAdjustRequest;
import it.espressamente.api.warehouse.dto.WarehouseMovementResponse;
import it.espressamente.api.warehouse.dto.WarehouseStockResponse;
import it.espressamente.api.warehouse.entity.WarehouseMovement;
import it.espressamente.api.warehouse.entity.WarehouseStock;
import it.espressamente.api.warehouse.enums.MovementType;
import it.espressamente.api.warehouse.repository.WarehouseMovementRepository;
import it.espressamente.api.warehouse.repository.WarehouseStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseService {

    private final WarehouseStockRepository stockRepository;
    private final WarehouseMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final AuditService auditService;

    public List<WarehouseStockResponse> getStock() {
        return stockRepository.findAllWithProduct().stream()
                .map(this::toStockResponse)
                .collect(Collectors.toList());
    }

    public List<WarehouseStockResponse> getLowStock() {
        return stockRepository.findLowStock().stream()
                .map(this::toStockResponse)
                .collect(Collectors.toList());
    }

    public Page<WarehouseMovementResponse> getMovements(Long productId, Pageable pageable) {
        if (productId != null) {
            return movementRepository.findByProductId(productId, pageable)
                    .map(this::toMovementResponse);
        }
        return movementRepository.findAllWithProduct(pageable)
                .map(this::toMovementResponse);
    }

    @Transactional
    public WarehouseStockResponse adjustStock(StockAdjustRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Prodotto non trovato: " + request.getProductId()));

        MovementType type = MovementType.valueOf(request.getMovementType());

        WarehouseStock stock = stockRepository.findByProductId(request.getProductId())
                .orElseGet(() -> WarehouseStock.builder()
                        .product(product)
                        .quantity(0)
                        .reorderPoint(5)
                        .build());

        int previousStock = stock.getQuantity();
        int delta = calculateDelta(type, request.getQuantity());
        int newStock = previousStock + delta;

        if (newStock < 0) {
            throw new IllegalStateException("Giacenza insufficiente. Disponibile: " + previousStock);
        }

        stock.setQuantity(newStock);
        if (request.getReorderPoint() != null) {
            stock.setReorderPoint(request.getReorderPoint());
        }
        stockRepository.save(stock);

        String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        WarehouseMovement movement = WarehouseMovement.builder()
                .product(product)
                .store(stock.getStore())
                .movementType(type)
                .quantity(request.getQuantity())
                .previousStock(previousStock)
                .newStock(newStock)
                .notes(request.getNotes())
                .adminUsername(adminUsername)
                .build();
        movementRepository.save(movement);

        auditService.log("STOCK_ADJUST", "WarehouseStock", stock.getId(),
                type + " " + request.getQuantity() + " x " + product.getName() + " (" + previousStock + " → " + newStock + ")");

        return toStockResponse(stock);
    }

    @Transactional
    public void deductForInvoice(Invoice invoice) {
        for (InvoiceItem item : invoice.getItems()) {
            if (item.getProduct() == null) continue;

            Long productId = item.getProduct().getId();
            WarehouseStock stock = stockRepository.findByProductId(productId).orElse(null);
            if (stock == null) continue;

            int previousStock = stock.getQuantity();
            int newStock = Math.max(0, previousStock - item.getQuantity());
            stock.setQuantity(newStock);
            stockRepository.save(stock);

            WarehouseMovement movement = WarehouseMovement.builder()
                    .product(item.getProduct())
                    .store(stock.getStore())
                    .movementType(MovementType.VENDITA)
                    .quantity(item.getQuantity())
                    .previousStock(previousStock)
                    .newStock(newStock)
                    .referenceType("INVOICE")
                    .referenceId(invoice.getId())
                    .notes("Fattura " + invoice.getInvoiceNumber())
                    .adminUsername("system")
                    .build();
            movementRepository.save(movement);
        }

        auditService.log("STOCK_DEDUCT", "Invoice", invoice.getId(),
                "Scarico magazzino per fattura " + invoice.getInvoiceNumber());
    }

    private int calculateDelta(MovementType type, int quantity) {
        return switch (type) {
            case CARICO, RESO -> quantity;
            case SCARICO, VENDITA -> -quantity;
            case RETTIFICA -> quantity; // rettifica can be positive (use SCARICO for negative)
        };
    }

    private WarehouseStockResponse toStockResponse(WarehouseStock ws) {
        return WarehouseStockResponse.builder()
                .id(ws.getId())
                .productId(ws.getProduct().getId())
                .productSku(ws.getProduct().getSku())
                .productName(ws.getProduct().getName())
                .productType(ws.getProduct().getProductType().name())
                .storeId(ws.getStore() != null ? ws.getStore().getId() : null)
                .storeName(ws.getStore() != null ? ws.getStore().getName() : null)
                .quantity(ws.getQuantity())
                .reorderPoint(ws.getReorderPoint())
                .lowStock(ws.getQuantity() <= ws.getReorderPoint())
                .build();
    }

    private WarehouseMovementResponse toMovementResponse(WarehouseMovement wm) {
        return WarehouseMovementResponse.builder()
                .id(wm.getId())
                .productId(wm.getProduct().getId())
                .productName(wm.getProduct().getName())
                .movementType(wm.getMovementType().name())
                .quantity(wm.getQuantity())
                .previousStock(wm.getPreviousStock())
                .newStock(wm.getNewStock())
                .referenceType(wm.getReferenceType())
                .referenceId(wm.getReferenceId())
                .notes(wm.getNotes())
                .adminUsername(wm.getAdminUsername())
                .createdAt(wm.getCreatedAt())
                .build();
    }
}

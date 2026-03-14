package it.espressamente.api.contact.service;

import it.espressamente.api.contact.dto.ComodatoFormRequest;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.contact.entity.ComodatoRequest;
import it.espressamente.api.product.entity.Product;
import it.espressamente.api.contact.enums.RequestStatus;
import it.espressamente.api.contact.repository.ComodatoRequestRepository;
import it.espressamente.api.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import it.espressamente.api.notification.service.EmailService;
import it.espressamente.api.admin.service.AuditService;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComodatoService {

    private final ComodatoRequestRepository comodatoRepo;
    private final ProductRepository productRepo;
    private final EmailService emailService;
    private final AuditService auditService;

    @Transactional
    public ComodatoRequest submit(ComodatoFormRequest form) {
        Product machine = null;
        String machineName = form.getMachineName();

        if (form.getMachineId() != null) {
            // Carica solo il nome (evita load completo con jsonb → dirty-check → UPDATE)
            machineName = productRepo.findNameById(form.getMachineId()).orElse(machineName);
            if (machineName != null) {
                // Reference proxy: imposta solo la FK senza caricare l'entità completa
                machine = productRepo.getReferenceById(form.getMachineId());
            }
        }

        ComodatoRequest request = ComodatoRequest.builder()
                .clientType(form.getClientType() != null ? form.getClientType() : "PRIVATO")
                .vatNumber(form.getVatNumber())
                .fullName(form.getFullName())
                .email(form.getEmail())
                .phone(form.getPhone())
                .companyName(form.getCompanyName())
                .address(form.getAddress())
                .city(form.getCity())
                .province(form.getProvince())
                .machine(machine)
                .machineName(machineName)
                .deliveryType(form.getDeliveryType())
                .notes(form.getNotes())
                .build();

        ComodatoRequest saved = comodatoRepo.save(request);
        emailService.sendComodatoNotification(saved);
        log.info("Nuova richiesta comodato da: {} ({}) — macchina: {}",
                saved.getFullName(), saved.getCity(), saved.getMachineName());
        return saved;
    }

    public Page<ComodatoRequest> getAll(Pageable pageable) {
        return comodatoRepo.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<ComodatoRequest> getByStatus(RequestStatus status, Pageable pageable) {
        return comodatoRepo.findByStatusOrderByCreatedAtDesc(status, pageable);
    }

    public ComodatoRequest getById(Long id) {
        return comodatoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Richiesta comodato non trovata: " + id));
    }

    @Transactional
    public ComodatoRequest updateStatus(Long id, RequestStatus status, String internalNotes) {
        ComodatoRequest request = getById(id);
        request.setStatus(status);
        if (internalNotes != null) request.setInternalNotes(internalNotes);
        ComodatoRequest saved = comodatoRepo.save(request);
        auditService.log("STATUS_CHANGE", "ComodatoRequest", saved.getId(), "Stato comodato → " + status);
        return saved;
    }

    public long countPending() {
        return comodatoRepo.countByStatus(RequestStatus.NUOVO);
    }
}

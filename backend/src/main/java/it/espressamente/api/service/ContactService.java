package it.espressamente.api.service;

import it.espressamente.api.dto.request.ContactFormRequest;
import it.espressamente.api.dto.request.ServiceFormRequest;
import it.espressamente.api.exception.ResourceNotFoundException;
import it.espressamente.api.model.entity.ContactRequest;
import it.espressamente.api.model.entity.ServiceRequest;
import it.espressamente.api.model.enums.ContactType;
import it.espressamente.api.model.enums.RequestStatus;
import it.espressamente.api.repository.ContactRequestRepository;
import it.espressamente.api.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactRequestRepository contactRepo;
    private final ServiceRequestRepository serviceRepo;
    private final EmailService emailService;

    // ── Contact Requests ──

    @Transactional
    public ContactRequest submitContact(ContactFormRequest form) {
        ContactRequest request = ContactRequest.builder()
                .fullName(form.getFullName())
                .email(form.getEmail())
                .phone(form.getPhone())
                .subject(form.getSubject())
                .message(form.getMessage())
                .contactType(form.getContactType() != null ? form.getContactType() : ContactType.INFO)
                .status(RequestStatus.NUOVO)
                .build();

        ContactRequest saved = contactRepo.save(request);
        emailService.sendContactNotification(saved);
        log.info("Nuova richiesta contatto da: {} ({})", saved.getFullName(), saved.getEmail());
        return saved;
    }

    public Page<ContactRequest> getAllContacts(Pageable pageable) {
        return contactRepo.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<ContactRequest> getContactsByStatus(RequestStatus status, Pageable pageable) {
        return contactRepo.findByStatusOrderByCreatedAtDesc(status, pageable);
    }

    @Transactional
    public ContactRequest updateContactStatus(Long id, RequestStatus status) {
        ContactRequest request = contactRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Richiesta non trovata: " + id));
        request.setStatus(status);
        return contactRepo.save(request);
    }

    // ── Service Requests ──

    @Transactional
    public ServiceRequest submitServiceRequest(ServiceFormRequest form) {
        ServiceRequest request = ServiceRequest.builder()
                .fullName(form.getFullName())
                .email(form.getEmail())
                .phone(form.getPhone())
                .machineType(form.getMachineType())
                .machineBrand(form.getMachineBrand())
                .machineModel(form.getMachineModel())
                .issueDescription(form.getIssueDescription())
                .preferredDate(form.getPreferredDate())
                .status(RequestStatus.NUOVO)
                .build();

        ServiceRequest saved = serviceRepo.save(request);
        emailService.sendServiceNotification(saved);
        log.info("Nuova richiesta assistenza da: {} - {} {}", saved.getFullName(), saved.getMachineBrand(), saved.getMachineModel());
        return saved;
    }

    public Page<ServiceRequest> getAllServiceRequests(Pageable pageable) {
        return serviceRepo.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public ServiceRequest updateServiceStatus(Long id, RequestStatus status) {
        ServiceRequest request = serviceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Richiesta assistenza non trovata: " + id));
        request.setStatus(status);
        return serviceRepo.save(request);
    }

    // ── Stats ──

    public long countPendingContacts() {
        return contactRepo.countByStatus(RequestStatus.NUOVO);
    }

    public long countPendingServices() {
        return serviceRepo.countByStatus(RequestStatus.NUOVO);
    }
}

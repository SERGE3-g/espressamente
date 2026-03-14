package it.espressamente.api.customer.service;

import it.espressamente.api.customer.dto.CustomerInteractionRequest;
import it.espressamente.api.customer.dto.CustomerRequest;
import it.espressamente.api.customer.dto.CustomerInteractionResponse;
import it.espressamente.api.customer.dto.CustomerResponse;
import it.espressamente.api.common.exception.ResourceNotFoundException;
import it.espressamente.api.auth.entity.AdminUser;
import it.espressamente.api.customer.entity.Customer;
import it.espressamente.api.customer.entity.CustomerInteraction;
import it.espressamente.api.contact.enums.ClientType;
import it.espressamente.api.customer.enums.InteractionType;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import it.espressamente.api.auth.repository.AdminUserRepository;
import it.espressamente.api.contact.repository.ComodatoRequestRepository;
import it.espressamente.api.contact.repository.ContactRequestRepository;
import it.espressamente.api.contact.repository.ServiceRequestRepository;
import it.espressamente.api.customer.repository.CustomerInteractionRepository;
import it.espressamente.api.customer.repository.CustomerRepository;
import it.espressamente.api.admin.service.AuditService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerInteractionRepository interactionRepository;
    private final ComodatoRequestRepository comodatoRepo;
    private final ContactRequestRepository contactRepo;
    private final ServiceRequestRepository serviceRepo;
    private final AdminUserRepository adminUserRepo;
    private final AuditService auditService;

    // ── Customers CRUD ──────────────────────────────────────────────────────────

    public Page<CustomerResponse> getAll(String search, String clientType, Pageable pageable) {
        boolean hasType = clientType != null && !clientType.isBlank();
        ClientType type = hasType ? ClientType.valueOf(clientType) : null;

        // I campi sono cifrati in DB — carica tutti e filtra in-memory
        List<Customer> all = hasType
                ? customerRepository.findByIsActiveTrueAndClientTypeOrderByCreatedAtDesc(type)
                : customerRepository.findByIsActiveTrueOrderByCreatedAtDesc();

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            all = all.stream().filter(c -> matches(c, q)).collect(Collectors.toList());
        }

        int start = (int) pageable.getOffset();
        int end   = Math.min(start + pageable.getPageSize(), all.size());
        List<Customer> subList = start < all.size() ? all.subList(start, end) : List.<Customer>of();
        List<CustomerResponse> page = subList.stream().map(this::toResponse).collect(Collectors.toList());

        return new PageImpl<>(page, pageable, all.size());
    }

    public CustomerResponse getById(Long id) {
        return toResponse(findCustomer(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = new Customer();
        mapRequestToEntity(request, customer);
        Customer saved = customerRepository.save(customer);
        auditService.log("CREATE", "Customer", saved.getId(), "Creato cliente: " + saved.getFullName());
        return toResponse(saved);
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findCustomer(id);
        mapRequestToEntity(request, customer);
        Customer saved = customerRepository.save(customer);
        auditService.log("UPDATE", "Customer", saved.getId(), "Aggiornato cliente: " + saved.getFullName());
        return toResponse(saved);
    }

    @Transactional
    public void deactivate(Long id) {
        Customer customer = findCustomer(id);
        customer.setIsActive(false);
        customerRepository.save(customer);
        auditService.log("DEACTIVATE", "Customer", id, "Disattivato cliente: " + customer.getFullName());
    }

    // ── Linked requests ─────────────────────────────────────────────────────────

    public List<?> getComodatoByCustomer(Long customerId) {
        findCustomer(customerId);
        return comodatoRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<?> getContattiByCustomer(Long customerId) {
        findCustomer(customerId);
        return contactRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<?> getAssistenzaByCustomer(Long customerId) {
        findCustomer(customerId);
        return serviceRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    // ── Interactions ────────────────────────────────────────────────────────────

    public List<CustomerInteractionResponse> getInteractions(Long customerId) {
        findCustomer(customerId);
        return interactionRepository.findByCustomerIdWithAdmin(customerId)
                .stream()
                .map(this::toInteractionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerInteractionResponse createInteraction(Long customerId, CustomerInteractionRequest request) {
        Customer customer = findCustomer(customerId);

        AdminUser admin = null;
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetails userDetails) {
            admin = adminUserRepo.findByUsername(userDetails.getUsername()).orElse(null);
        }

        CustomerInteraction interaction = CustomerInteraction.builder()
                .customer(customer)
                .type(InteractionType.valueOf(request.getType()))
                .subject(request.getSubject())
                .description(request.getDescription())
                .date(request.getDate() != null ? LocalDateTime.parse(request.getDate()) : LocalDateTime.now())
                .adminUser(admin)
                .build();

        CustomerInteraction saved = interactionRepository.save(interaction);
        auditService.log("CREATE", "CustomerInteraction", saved.getId(), "Aggiunta interazione per cliente #" + customerId);
        return toInteractionResponse(saved);
    }

    @Transactional
    public void deleteInteraction(Long customerId, Long interactionId) {
        findCustomer(customerId);
        CustomerInteraction interaction = interactionRepository.findById(interactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interazione non trovata: " + interactionId));
        if (!interaction.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Interazione non appartiene al cliente");
        }
        interactionRepository.delete(interaction);
        auditService.log("DELETE", "CustomerInteraction", interactionId, "Eliminata interazione per cliente #" + customerId);
    }

    public long countAll() {
        return customerRepository.countByIsActiveTrue();
    }

    // ── Private helpers ──────────────────────────────────────────────────────────

    private boolean matches(Customer c, String q) {
        return (c.getFullName()    != null && c.getFullName().toLowerCase().contains(q))
            || (c.getEmail()       != null && c.getEmail().toLowerCase().contains(q))
            || (c.getCompanyName() != null && c.getCompanyName().toLowerCase().contains(q));
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente non trovato: " + id));
    }

    private void mapRequestToEntity(CustomerRequest req, Customer c) {
        c.setFullName(req.getFullName());
        c.setEmail(req.getEmail());
        c.setPhone(req.getPhone());
        c.setCompanyName(req.getCompanyName());
        c.setVatNumber(req.getVatNumber());
        c.setFiscalCode(req.getFiscalCode());
        c.setClientType(req.getClientType() != null ? ClientType.valueOf(req.getClientType()) : ClientType.PRIVATO);
        c.setAddress(req.getAddress());
        c.setCity(req.getCity());
        c.setProvince(req.getProvince());
        c.setCap(req.getCap());
        c.setCountry(req.getCountry() != null ? req.getCountry() : "Italia");
        c.setNotes(req.getNotes());
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .fullName(c.getFullName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .companyName(c.getCompanyName())
                .vatNumber(c.getVatNumber())
                .fiscalCode(c.getFiscalCode())
                .clientType(c.getClientType().name())
                .address(c.getAddress())
                .city(c.getCity())
                .province(c.getProvince())
                .cap(c.getCap())
                .country(c.getCountry())
                .notes(c.getNotes())
                .isActive(c.getIsActive())
                .totalComodato(comodatoRepo.countByCustomerId(c.getId()))
                .totalContatti(contactRepo.countByCustomerId(c.getId()))
                .totalAssistenza(serviceRepo.countByCustomerId(c.getId()))
                .totalInteractions(interactionRepository.countByCustomerId(c.getId()))
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private CustomerInteractionResponse toInteractionResponse(CustomerInteraction ci) {
        return CustomerInteractionResponse.builder()
                .id(ci.getId())
                .type(ci.getType().name())
                .subject(ci.getSubject())
                .description(ci.getDescription())
                .date(ci.getDate())
                .adminUsername(ci.getAdminUser() != null ? ci.getAdminUser().getUsername() : null)
                .adminFullName(ci.getAdminUser() != null ? ci.getAdminUser().getFullName() : null)
                .createdAt(ci.getCreatedAt())
                .build();
    }
}

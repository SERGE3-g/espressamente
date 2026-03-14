package it.espressamente.api.admin.controller;

import it.espressamente.api.common.dto.ApiResponse;
import it.espressamente.api.admin.dto.DashboardResponse;
import it.espressamente.api.contact.enums.RequestStatus;
import it.espressamente.api.contact.repository.ComodatoRequestRepository;
import it.espressamente.api.contact.repository.ContactRequestRepository;
import it.espressamente.api.customer.repository.CustomerRepository;
import it.espressamente.api.product.repository.ProductRepository;
import it.espressamente.api.contact.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','STORE_MANAGER','EMPLOYEE')")
public class AdminController {

    private final ProductRepository productRepository;
    private final ContactRequestRepository contactRequestRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ComodatoRequestRepository comodatoRequestRepository;
    private final CustomerRepository customerRepository;

    @GetMapping("/v1/admin/stats")
    public ApiResponse<DashboardResponse> getStats() {
        DashboardResponse stats = DashboardResponse.builder()
                .totalProducts(productRepository.countByIsActiveTrue())
                .pendingContacts(contactRequestRepository.countByStatus(RequestStatus.NUOVO))
                .pendingServices(serviceRequestRepository.countByStatus(RequestStatus.NUOVO))
                .pendingComodato(comodatoRequestRepository.countByStatus(RequestStatus.NUOVO))
                .totalCustomers(customerRepository.countByIsActiveTrue())
                .build();
        return ApiResponse.ok(stats);
    }
}

package it.espressamente.api.admin.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private long totalProducts;
    private long totalCategories;
    private long totalBrands;
    private long pendingContacts;
    private long pendingServices;
    private long pendingComodato;
    private long totalCustomers;
}

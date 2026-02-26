package it.espressamente.api.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private long totalProducts;
    private long totalCategories;
    private long totalBrands;
    private long pendingContacts;
    private long pendingServices;
}

package it.espressamente.api.invoice.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccountingSummaryResponse {
    private BigDecimal totalEntrate;
    private BigDecimal totalUscite;
    private BigDecimal bilancio;
    private String periodFrom;
    private String periodTo;
}

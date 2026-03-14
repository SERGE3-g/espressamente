package it.espressamente.api.invoice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfitAndLossResponse {

    private List<CategoryBreakdown> categories;
    private BigDecimal totalEntrate;
    private BigDecimal totalUscite;
    private BigDecimal netResult;
    private String periodFrom;
    private String periodTo;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryBreakdown {
        private String category;
        private BigDecimal entrate;
        private BigDecimal uscite;
        private BigDecimal netto;
    }
}

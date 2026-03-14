package it.espressamente.api.warehouse.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImportResult {
    @Builder.Default
    private int totalRows = 0;
    @Builder.Default
    private int created = 0;
    @Builder.Default
    private int updated = 0;
    @Builder.Default
    private int skipped = 0;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
}

package it.espressamente.api.admin.dto;

import it.espressamente.api.auth.entity.Store;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreResponse {

    private Long id;
    private String name;
    private String address;
    private String city;
    private String phone;
    private String email;
    private Boolean isActive;

    public static StoreResponse from(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .address(store.getAddress())
                .city(store.getCity())
                .phone(store.getPhone())
                .email(store.getEmail())
                .isActive(store.getIsActive())
                .build();
    }
}

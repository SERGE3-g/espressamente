package it.espressamente.api.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import it.espressamente.api.common.entity.BaseEntity;

@Entity
@Table(name = "pages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Page extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // Rich text / HTML

    @Column(name = "meta_title", length = 160)
    private String metaTitle;

    @Column(name = "meta_description", length = 320)
    private String metaDescription;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}

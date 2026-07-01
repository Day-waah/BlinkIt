package com.blinkitclone.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private double price;

    @Builder.Default
    private double discount = 0.0; // In percentage, e.g., 10.0 for 10%

    @NotNull
    @Min(0)
    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @NotBlank
    @Column(nullable = false)
    private String unit; // e.g. "1 kg", "500 g", "1 unit"

    @Builder.Default
    private double rating = 0.0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "brand")
    private String brand;
}

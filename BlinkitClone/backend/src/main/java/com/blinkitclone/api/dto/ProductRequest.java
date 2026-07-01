package com.blinkitclone.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private double price;

    private double discount; // percentage

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private int stockQuantity;

    @NotBlank(message = "Unit is required (e.g. 1 kg, 250 g)")
    private String unit;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String imageUrl;
    
    private String brand;
}

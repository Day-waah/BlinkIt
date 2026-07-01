package com.blinkitclone.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    @NotNull(message = "Address ID is required")
    private Long addressId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // e.g. COD, CARD, UPI, STRIPE, RAZORPAY

    private String paymentGatewayId; // mock or real gateway reference

    @NotEmpty(message = "Cart cannot be empty")
    private List<OrderItemRequest> items;
}

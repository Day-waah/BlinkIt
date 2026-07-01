package com.blinkitclone.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BudgetRequest {
    @NotNull(message = "Budget amount is required")
    @Min(value = 1, message = "Budget must be greater than 0")
    private double amount;

    @NotBlank(message = "Duration is required (SESSION, WEEKLY, MONTHLY)")
    private String duration;
}

package com.blinkitclone.api.dto;

import com.blinkitclone.api.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetOverflowResponse {
    private double exceededAmount;
    private double cartTotal;
    private double budgetLimit;
    private double remainingBudget;
    private List<Product> overflowingProducts;
    private List<BudgetAlternativeResponse> suggestedSwaps;
}

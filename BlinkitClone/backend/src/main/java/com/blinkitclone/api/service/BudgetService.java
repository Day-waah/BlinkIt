package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.BudgetAlternativeResponse;
import com.blinkitclone.api.dto.BudgetOverflowResponse;
import com.blinkitclone.api.dto.BudgetRequest;
import com.blinkitclone.api.dto.BudgetResponse;
import com.blinkitclone.api.dto.OrderItemRequest;
import com.blinkitclone.api.entity.Budget;
import java.util.List;

public interface BudgetService {
    BudgetResponse getActiveBudget(Long userId);
    BudgetResponse setBudget(Long userId, BudgetRequest request);
    void deactivateBudget(Long userId);
    BudgetResponse syncBudgetWithCart(Long userId, double cartTotal);
    BudgetAlternativeResponse getCheaperAlternatives(Long productId);
    BudgetOverflowResponse checkBudgetOverflow(Long userId, List<OrderItemRequest> cartItems);
}

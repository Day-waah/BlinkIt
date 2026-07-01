package com.blinkitclone.api.controller;

import com.blinkitclone.api.dto.*;
import com.blinkitclone.api.security.UserPrincipal;
import com.blinkitclone.api.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping("/active")
    public ResponseEntity<BudgetResponse> getActiveBudget(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        BudgetResponse response = budgetService.getActiveBudget(userPrincipal.getId());
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> setBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = budgetService.setBudget(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/active")
    public ResponseEntity<Void> deactivateBudget(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        budgetService.deactivateBudget(userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<BudgetResponse> syncBudgetWithCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam double cartTotal) {
        BudgetResponse response = budgetService.syncBudgetWithCart(userPrincipal.getId(), cartTotal);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alternatives/{productId}")
    public ResponseEntity<BudgetAlternativeResponse> getCheaperAlternatives(@PathVariable Long productId) {
        BudgetAlternativeResponse response = budgetService.getCheaperAlternatives(productId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/overflow")
    public ResponseEntity<BudgetOverflowResponse> checkBudgetOverflow(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody List<OrderItemRequest> cartItems) {
        BudgetOverflowResponse response = budgetService.checkBudgetOverflow(userPrincipal.getId(), cartItems);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }
}

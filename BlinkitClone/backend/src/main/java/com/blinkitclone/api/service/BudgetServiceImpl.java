package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.*;
import com.blinkitclone.api.entity.Budget;
import com.blinkitclone.api.entity.BudgetDuration;
import com.blinkitclone.api.entity.Product;
import com.blinkitclone.api.entity.User;
import com.blinkitclone.api.exception.BadRequestException;
import com.blinkitclone.api.exception.ResourceNotFoundException;
import com.blinkitclone.api.repository.BudgetRepository;
import com.blinkitclone.api.repository.ProductRepository;
import com.blinkitclone.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public BudgetResponse getActiveBudget(Long userId) {
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndActiveTrue(userId);
        if (budgetOpt.isEmpty()) {
            return null;
        }
        return mapToResponse(budgetOpt.get());
    }

    @Override
    @Transactional
    public BudgetResponse setBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BudgetDuration duration;
        try {
            duration = BudgetDuration.valueOf(request.getDuration().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid budget duration. Choose SESSION, WEEKLY, or MONTHLY.");
        }

        // Check if there is already an active budget, if so update it, otherwise create new
        Budget budget = budgetRepository.findByUserIdAndActiveTrue(userId)
                .orElse(Budget.builder().user(user).build());

        budget.setAmount(request.getAmount());
        budget.setDuration(duration);
        budget.setRemainingAmount(request.getAmount()); // Initial remaining matches total
        budget.setActive(true);

        Budget saved = budgetRepository.save(budget);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deactivateBudget(Long userId) {
        Budget budget = budgetRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No active budget found for user"));
        budget.setActive(false);
        budgetRepository.save(budget);
    }

    @Override
    @Transactional
    public BudgetResponse syncBudgetWithCart(Long userId, double cartTotal) {
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndActiveTrue(userId);
        if (budgetOpt.isEmpty()) {
            return null;
        }
        Budget budget = budgetOpt.get();
        budget.setRemainingAmount(budget.getAmount() - cartTotal);
        Budget saved = budgetRepository.save(budget);
        return mapToResponse(saved);
    }

    @Override
    public BudgetAlternativeResponse getCheaperAlternatives(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        double effectivePrice = getEffectivePrice(product);
        List<Product> cheaperProducts = productRepository.findCheaperAlternatives(
                product.getCategory().getId(), 
                effectivePrice
        );

        return BudgetAlternativeResponse.builder()
                .originalProduct(product)
                .alternatives(cheaperProducts)
                .build();
    }

    @Override
    public BudgetOverflowResponse checkBudgetOverflow(Long userId, List<OrderItemRequest> cartItems) {
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndActiveTrue(userId);
        if (budgetOpt.isEmpty()) {
            return null;
        }

        Budget budget = budgetOpt.get();
        double cartTotal = 0.0;
        List<ProductPriceTuple> itemDetails = new ArrayList<>();

        for (OrderItemRequest item : cartItems) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProductId()));
            double price = getEffectivePrice(product) * item.getQuantity();
            cartTotal += price;
            itemDetails.add(new ProductPriceTuple(product, price, item.getQuantity()));
        }

        double remaining = budget.getAmount() - cartTotal;
        if (cartTotal <= budget.getAmount()) {
            return BudgetOverflowResponse.builder()
                    .exceededAmount(0.0)
                    .cartTotal(cartTotal)
                    .budgetLimit(budget.getAmount())
                    .remainingBudget(remaining)
                    .overflowingProducts(new ArrayList<>())
                    .suggestedSwaps(new ArrayList<>())
                    .build();
        }

        double exceeded = cartTotal - budget.getAmount();

        // Find products in cart causing budget overflow (sorted by total cost descending)
        List<Product> overflowingProducts = itemDetails.stream()
                .sorted((t1, t2) -> Double.compare(t2.totalPrice(), t1.totalPrice()))
                .map(ProductPriceTuple::product)
                .collect(Collectors.toList());

        // For overflowing products, suggest cheaper alternatives
        List<BudgetAlternativeResponse> suggestedSwaps = new ArrayList<>();
        for (Product overflowProduct : overflowingProducts) {
            BudgetAlternativeResponse alternatives = getCheaperAlternatives(overflowProduct.getId());
            if (!alternatives.getAlternatives().isEmpty()) {
                suggestedSwaps.add(alternatives);
            }
        }

        return BudgetOverflowResponse.builder()
                .exceededAmount(exceeded)
                .cartTotal(cartTotal)
                .budgetLimit(budget.getAmount())
                .remainingBudget(remaining)
                .overflowingProducts(overflowingProducts)
                .suggestedSwaps(suggestedSwaps)
                .build();
    }

    private double getEffectivePrice(Product product) {
        return product.getPrice() * (1 - product.getDiscount() / 100.0);
    }

    private BudgetResponse mapToResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .userId(budget.getUser().getId())
                .amount(budget.getAmount())
                .duration(budget.getDuration().name())
                .remainingAmount(budget.getRemainingAmount())
                .active(budget.isActive())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }

    private record ProductPriceTuple(Product product, double totalPrice, int quantity) {}
}

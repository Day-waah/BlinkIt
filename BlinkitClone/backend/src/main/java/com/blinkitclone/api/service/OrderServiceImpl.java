package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.OrderItemRequest;
import com.blinkitclone.api.dto.OrderRequest;
import com.blinkitclone.api.entity.*;
import com.blinkitclone.api.exception.BadRequestException;
import com.blinkitclone.api.exception.InsufficientStockException;
import com.blinkitclone.api.exception.ResourceNotFoundException;
import com.blinkitclone.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public Order placeOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to user");
        }

        Order order = Order.builder()
                .user(user)
                .address(address)
                .paymentMethod(request.getPaymentMethod())
                .paymentGatewayId(request.getPaymentGatewayId())
                .status(OrderStatus.CONFIRMED) // Default confirm
                .build();

        if (request.getPaymentMethod().equalsIgnoreCase("COD")) {
            order.setPaymentStatus("PENDING");
        } else {
            order.setPaymentStatus("PAID"); // Pre-authorized mock payment
        }

        double totalAmount = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName() 
                        + ". Available: " + product.getStockQuantity());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            double unitPrice = product.getPrice() * (1 - product.getDiscount() / 100.0);
            double itemTotal = unitPrice * itemReq.getQuantity();
            totalAmount += itemTotal;

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .priceAtPurchase(unitPrice)
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        // Smart Budget Logic integration
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndActiveTrue(userId);
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            order.setBudgetId(budget.getId());

            // Deduct from remaining budget
            budget.setRemainingAmount(budget.getRemainingAmount() - totalAmount);

            // If it is a single SESSION budget, deactivate it on checkout completion
            if (budget.getDuration() == BudgetDuration.SESSION) {
                budget.setActive(false);
            }
            budgetRepository.save(budget);
        }

        Order savedOrder = orderRepository.save(order);

        // Send confirmation email/notification
        notificationService.sendOrderConfirmationEmail(user, savedOrder.getId(), totalAmount);

        return savedOrder;
    }

    @Override
    public List<Order> getOrderHistory(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Order getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        // Authorization check (except for ADMIN)
        boolean isOwner = order.getUser().getId().equals(userId);
        boolean isAdmin = order.getUser().getRoles().contains(Role.ROLE_ADMIN); // simple check
        
        if (!isOwner && !isAdmin) {
            throw new BadRequestException("Unauthorized access to this order details");
        }
        return order;
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status value.");
        }

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = getOrderById(orderId, userId);

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel order that is already delivered or cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore stock
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        // Restore budget remaining if budget is still active
        if (order.getBudgetId() != null) {
            Optional<Budget> budgetOpt = budgetRepository.findById(order.getBudgetId());
            if (budgetOpt.isPresent()) {
                Budget budget = budgetOpt.get();
                // Restore if it was deactivated because of session duration, reactivation is nice but keep simple:
                // if it's active, restore remaining
                if (budget.isActive() || budget.getDuration() == BudgetDuration.SESSION) {
                    budget.setRemainingAmount(budget.getRemainingAmount() + order.getTotalAmount());
                    // Re-activate session budget so they can shop again with remaining
                    if (budget.getDuration() == BudgetDuration.SESSION) {
                        budget.setActive(true);
                    }
                    budgetRepository.save(budget);
                }
            }
        }

        Order saved = orderRepository.save(order);

        // Send email/notification
        notificationService.sendOrderCancellationEmail(order.getUser(), order.getId());

        return saved;
    }
}

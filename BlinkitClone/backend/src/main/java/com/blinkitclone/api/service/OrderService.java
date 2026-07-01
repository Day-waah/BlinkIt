package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.OrderRequest;
import com.blinkitclone.api.entity.Order;
import com.blinkitclone.api.entity.OrderStatus;
import java.util.List;

public interface OrderService {
    Order placeOrder(Long userId, OrderRequest request);
    List<Order> getOrderHistory(Long userId);
    Order getOrderById(Long orderId, Long userId);
    Order updateOrderStatus(Long orderId, String status);
    Order cancelOrder(Long orderId, Long userId);
}

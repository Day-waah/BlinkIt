package com.blinkitclone.api.service;

import com.blinkitclone.api.entity.Notification;
import com.blinkitclone.api.entity.User;
import java.util.List;

public interface NotificationService {
    Notification sendNotification(User user, String title, String message);
    List<Notification> getNotificationsForUser(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void sendOrderConfirmationEmail(User user, Long orderId, double total);
    void sendOrderCancellationEmail(User user, Long orderId);
}

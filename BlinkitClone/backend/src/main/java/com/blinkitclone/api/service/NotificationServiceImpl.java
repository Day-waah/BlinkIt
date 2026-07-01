package com.blinkitclone.api.service;

import com.blinkitclone.api.entity.Notification;
import com.blinkitclone.api.entity.User;
import com.blinkitclone.api.exception.BadRequestException;
import com.blinkitclone.api.exception.ResourceNotFoundException;
import com.blinkitclone.api.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public Notification sendNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to notification");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void sendOrderConfirmationEmail(User user, Long orderId, double total) {
        String title = "Order Confirmed! - #" + orderId;
        String message = String.format("Hi %s, your order #%d of total ₹%.2f has been confirmed and is being processed.", user.getName(), orderId, total);
        
        // Save in-app notification
        sendNotification(user, title, message);

        // Send email
        String emailBody = String.format("""
                Hello %s,
                
                Thank you for shopping with Blinkit Clone!
                Your order #%d has been confirmed.
                
                Total Amount: ₹%.2f
                Status: CONFIRMED
                
                We are packing your items and will deliver them shortly.
                
                Best regards,
                Blinkit Clone Team
                """, user.getName(), orderId, total);

        sendEmail(user.getEmail(), "Blinkit Clone - Order Confirmation #" + orderId, emailBody);
    }

    @Override
    public void sendOrderCancellationEmail(User user, Long orderId) {
        String title = "Order Cancelled - #" + orderId;
        String message = String.format("Hi %s, your order #%d has been successfully cancelled.", user.getName(), orderId);

        // Save in-app notification
        sendNotification(user, title, message);

        // Send email
        String emailBody = String.format("""
                Hello %s,
                
                Your order #%d has been cancelled as requested.
                If you made a payment, refunds will be processed within 5-7 business days.
                
                We hope to shop with you again soon!
                
                Best regards,
                Blinkit Clone Team
                """, user.getName(), orderId);

        sendEmail(user.getEmail(), "Blinkit Clone - Order Cancellation #" + orderId, emailBody);
    }

    private void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            logger.warn("JavaMailSender not configured. Logging mock email instead:");
            logger.info("MOCK EMAIL SENT TO: {}\nSUBJECT: {}\nBODY: \n{}", to, subject, body);
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            mailSender.send(mailMessage);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {} due to: {}. Printing template:", to, e.getMessage());
            logger.info("TEMPLATE EMAIL FOR: {}\nSUBJECT: {}\nBODY:\n{}", to, subject, body);
        }
    }
}

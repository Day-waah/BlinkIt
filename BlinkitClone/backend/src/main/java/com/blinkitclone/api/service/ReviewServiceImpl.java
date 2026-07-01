package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.ReviewRequest;
import com.blinkitclone.api.entity.Product;
import com.blinkitclone.api.entity.Review;
import com.blinkitclone.api.entity.User;
import com.blinkitclone.api.exception.BadRequestException;
import com.blinkitclone.api.exception.ResourceNotFoundException;
import com.blinkitclone.api.repository.ProductRepository;
import com.blinkitclone.api.repository.ReviewRepository;
import com.blinkitclone.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Review addReview(Long userId, Long productId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        updateProductAverageRating(product);

        return saved;
    }

    @Override
    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to delete this review");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductAverageRating(product);
    }

    private void updateProductAverageRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductId(product.getId());
        if (reviews.isEmpty()) {
            product.setRating(0.0);
        } else {
            double sum = reviews.stream().mapToDouble(Review::getRating).sum();
            double avg = sum / reviews.size();
            product.setRating(Math.round(avg * 10.0) / 10.0); // round to 1 decimal place
        }
        productRepository.save(product);
    }
}

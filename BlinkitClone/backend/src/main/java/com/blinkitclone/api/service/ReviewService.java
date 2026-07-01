package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.ReviewRequest;
import com.blinkitclone.api.entity.Review;
import java.util.List;

public interface ReviewService {
    Review addReview(Long userId, Long productId, ReviewRequest request);
    List<Review> getReviewsByProduct(Long productId);
    void deleteReview(Long reviewId, Long userId);
}

package com.blinkitclone.api.service;

import com.blinkitclone.api.entity.Wishlist;
import java.util.List;

public interface WishlistService {
    Wishlist addToWishlist(Long userId, Long productId);
    List<Wishlist> getWishlist(Long userId);
    void removeFromWishlist(Long userId, Long productId);
}

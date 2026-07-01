package com.blinkitclone.api.controller;

import com.blinkitclone.api.entity.Wishlist;
import com.blinkitclone.api.security.UserPrincipal;
import com.blinkitclone.api.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping("/product/{productId}")
    public ResponseEntity<Wishlist> addToWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        Wishlist wishlist = wishlistService.addToWishlist(userPrincipal.getId(), productId);
        return new ResponseEntity<>(wishlist, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Wishlist>> getWishlist(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Wishlist> wishlist = wishlistService.getWishlist(userPrincipal.getId());
        return ResponseEntity.ok(wishlist);
    }

    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok().build();
    }
}

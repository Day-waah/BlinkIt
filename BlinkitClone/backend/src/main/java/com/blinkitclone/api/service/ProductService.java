package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.ProductRequest;
import com.blinkitclone.api.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    Product createProduct(ProductRequest request);
    Page<Product> getAllProducts(Pageable pageable);
    Product getProductById(Long id);
    Page<Product> getProductsByCategory(String categorySlug, Pageable pageable);
    Page<Product> searchProducts(String query, Pageable pageable);
    Product updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    List<Product> getSmartRecommendations(Long userId, Long categoryId, Pageable pageable);
}

package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.ProductRequest;
import com.blinkitclone.api.entity.Budget;
import com.blinkitclone.api.entity.Category;
import com.blinkitclone.api.entity.Product;
import com.blinkitclone.api.exception.ResourceNotFoundException;
import com.blinkitclone.api.repository.BudgetRepository;
import com.blinkitclone.api.repository.CategoryRepository;
import com.blinkitclone.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .discount(request.getDiscount())
                .stockQuantity(request.getStockQuantity())
                .unit(request.getUnit())
                .category(category)
                .imageUrl(request.getImageUrl())
                .brand(request.getBrand())
                .build();

        return productRepository.save(product);
    }

    @Override
    @Cacheable(value = "products", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Override
    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Override
    public Page<Product> getProductsByCategory(String categorySlug, Pageable pageable) {
        return productRepository.findByCategorySlug(categorySlug, pageable);
    }

    @Override
    public Page<Product> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable);
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscount(request.getDiscount());
        product.setStockQuantity(request.getStockQuantity());
        product.setUnit(request.getUnit());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
        product.setBrand(request.getBrand());

        return productRepository.save(product);
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    @Override
    public List<Product> getSmartRecommendations(Long userId, Long categoryId, Pageable pageable) {
        // Fetch all products in the category
        Page<Product> categoryProductsPage = productRepository.findByCategoryId(categoryId, pageable);
        List<Product> categoryProducts = new ArrayList<>(categoryProductsPage.getContent());

        Optional<Budget> activeBudgetOpt = budgetRepository.findByUserIdAndActiveTrue(userId);
        if (activeBudgetOpt.isEmpty()) {
            // No budget set, return products ordered by standard sorting
            return categoryProducts;
        }

        double remainingBudget = activeBudgetOpt.get().getRemainingAmount();

        // Sort products by budget fit:
        // 1. Fits within remaining budget (ordered by price ascending or discount percentage descending)
        // 2. Exceeds remaining budget (ordered by price ascending)
        List<Product> fitsBudget = categoryProducts.stream()
                .filter(p -> p.getPrice() <= remainingBudget)
                .sorted((p1, p2) -> {
                    // Sort by lower price first, or if price is close, higher discount
                    int priceCompare = Double.compare(p1.getPrice(), p2.getPrice());
                    if (priceCompare != 0) return priceCompare;
                    return Double.compare(p2.getDiscount(), p1.getDiscount());
                })
                .collect(Collectors.toList());

        List<Product> exceedsBudget = categoryProducts.stream()
                .filter(p -> p.getPrice() > remainingBudget)
                .sorted((p1, p2) -> Double.compare(p1.getPrice(), p2.getPrice()))
                .collect(Collectors.toList());

        List<Product> sortedList = new ArrayList<>();
        sortedList.addAll(fitsBudget);
        sortedList.addAll(exceedsBudget);

        return sortedList;
    }
}

package com.blinkitclone.api.repository;

import com.blinkitclone.api.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    
    Page<Product> findByCategorySlug(String slug, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.price < :currentPrice ORDER BY p.price ASC")
    List<Product> findCheaperAlternatives(@Param("categoryId") Long categoryId, @Param("currentPrice") double currentPrice);

    @Query("SELECT p FROM Product p WHERE p.price <= :budgetLimit ORDER BY p.price ASC")
    List<Product> findProductsWithinBudget(@Param("budgetLimit") double budgetLimit, Pageable pageable);

    List<Product> findByBrand(String brand);
}

package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.CategoryRequest;
import com.blinkitclone.api.entity.Category;
import java.util.List;

public interface CategoryService {
    Category createCategory(CategoryRequest request);
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
    Category getCategoryBySlug(String slug);
    Category updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}

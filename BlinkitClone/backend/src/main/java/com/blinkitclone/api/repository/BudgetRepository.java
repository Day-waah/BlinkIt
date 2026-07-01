package com.blinkitclone.api.repository;

import com.blinkitclone.api.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserId(Long userId);
    Optional<Budget> findByUserIdAndActiveTrue(Long userId);
}

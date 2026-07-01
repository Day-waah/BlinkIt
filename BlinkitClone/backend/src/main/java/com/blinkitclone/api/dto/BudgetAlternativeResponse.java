package com.blinkitclone.api.dto;

import com.blinkitclone.api.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAlternativeResponse {
    private Product originalProduct;
    private List<Product> alternatives;
}

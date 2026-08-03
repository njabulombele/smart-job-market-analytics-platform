package com.jobmarket.dto.ai;

import java.math.BigDecimal;

public record SalaryPredictionResponse(
    BigDecimal predictedSalary,
    BigDecimal rangeLow,
    BigDecimal rangeHigh,
    double confidence,
    String currency
) {}

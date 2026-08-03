package com.jobmarket.dto.analytics;

import java.math.BigDecimal;

public record SalaryStatsDto(
    String skill,
    String city,
    BigDecimal min,
    BigDecimal max,
    BigDecimal average,
    BigDecimal median,
    long sampleSize
) {}

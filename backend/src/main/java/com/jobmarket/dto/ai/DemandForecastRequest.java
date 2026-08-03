package com.jobmarket.dto.ai;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record DemandForecastRequest(
    @NotBlank String skill,
    @Min(1) @Max(24) int months
) {}

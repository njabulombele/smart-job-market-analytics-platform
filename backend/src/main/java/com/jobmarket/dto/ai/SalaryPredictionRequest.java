package com.jobmarket.dto.ai;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SalaryPredictionRequest(
    @Min(0) int experienceYears,
    @NotEmpty List<String> skills,
    @NotBlank String city,
    String company
) {}

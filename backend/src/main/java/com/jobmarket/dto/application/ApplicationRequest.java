package com.jobmarket.dto.application;

import jakarta.validation.constraints.NotNull;

public record ApplicationRequest(
    @NotNull Long jobId,
    String notes
) {}

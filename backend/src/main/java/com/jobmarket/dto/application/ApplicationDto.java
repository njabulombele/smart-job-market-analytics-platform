package com.jobmarket.dto.application;

import java.time.OffsetDateTime;

public record ApplicationDto(
    Long id,
    Long jobId,
    String jobTitle,
    String companyName,
    String status,
    OffsetDateTime appliedAt,
    String notes,
    OffsetDateTime createdAt
) {}

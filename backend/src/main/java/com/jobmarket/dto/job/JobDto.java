package com.jobmarket.dto.job;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

public record JobDto(
    Long id,
    String title,
    String description,
    String companyName,
    String companyLogoUrl,
    String city,
    String country,
    BigDecimal salaryMin,
    BigDecimal salaryMax,
    String salaryCurrency,
    String jobType,
    String experienceLevel,
    String remoteType,
    String sourceUrl,
    Set<String> skills,
    OffsetDateTime postedAt,
    int viewCount
) {}

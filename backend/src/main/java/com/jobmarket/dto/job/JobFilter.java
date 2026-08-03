package com.jobmarket.dto.job;

import java.math.BigDecimal;

public record JobFilter(
    String skill,
    String city,
    String company,
    String jobType,
    String experienceLevel,
    String remoteType,
    BigDecimal minSalary,
    BigDecimal maxSalary
) {}

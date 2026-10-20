package com.jobmarket.dto.analytics;

import java.io.Serializable;

public record TrendDataDto(String period, long jobCount, double changePercent)
    implements Serializable {}

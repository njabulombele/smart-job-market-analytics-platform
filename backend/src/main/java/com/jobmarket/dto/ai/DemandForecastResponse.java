package com.jobmarket.dto.ai;

import java.util.List;

public record DemandForecastResponse(
    String skill,
    String model,
    List<ForecastPoint> forecast
) {
    public record ForecastPoint(String period, double predicted, double lower, double upper) {}
}

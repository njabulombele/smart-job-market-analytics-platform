package com.jobmarket.dto.analytics;

import java.io.Serializable;

public record LocationDemandDto(String city, String country, long jobCount, double avgSalary)
    implements Serializable {}

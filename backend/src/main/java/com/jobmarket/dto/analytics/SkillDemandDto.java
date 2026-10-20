package com.jobmarket.dto.analytics;

import java.io.Serializable;

public record SkillDemandDto(String skill, String category, long jobCount, double percentChange)
    implements Serializable {}

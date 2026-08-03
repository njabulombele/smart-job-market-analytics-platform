package com.jobmarket.dto.ai;

import java.util.List;

public record ResumeMatchResponse(
    double score,
    List<String> matchedSkills,
    List<String> missingSkills,
    String explanation
) {}

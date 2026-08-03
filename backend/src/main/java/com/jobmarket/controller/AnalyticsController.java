package com.jobmarket.controller;

import com.jobmarket.dto.analytics.*;
import com.jobmarket.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Analytics", description = "Market analytics and insights")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/skills/top")
    @Operation(summary = "Get top N skills by job count")
    public ResponseEntity<List<SkillDemandDto>> getTopSkills(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(analyticsService.getTopSkills(limit));
    }

    @GetMapping("/locations/top")
    @Operation(summary = "Get top cities by job count")
    public ResponseEntity<List<LocationDemandDto>> getTopLocations(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopLocations(limit));
    }

    @GetMapping("/salary")
    @Operation(summary = "Get salary statistics for a skill and/or city")
    public ResponseEntity<SalaryStatsDto> getSalaryStats(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(analyticsService.getSalaryStats(skill, city));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get historical demand trend for a skill")
    public ResponseEntity<List<TrendDataDto>> getDemandTrend(
            @RequestParam String skill,
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(analyticsService.getDemandTrend(skill, months));
    }
}

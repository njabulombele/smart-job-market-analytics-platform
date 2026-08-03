package com.jobmarket.controller;

import com.jobmarket.dto.ai.*;
import com.jobmarket.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "AI Features", description = "Resume matching, salary prediction, forecasting, career coach")
public class AiController {

    private final AiService aiService;

    @PostMapping(value = "/resume/match", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Match a resume CV against a job posting")
    public ResponseEntity<ResumeMatchResponse> matchResume(
            @RequestPart("resume") MultipartFile resumeFile,
            @RequestParam Long jobId) {
        return ResponseEntity.ok(aiService.matchResume(resumeFile, jobId));
    }

    @PostMapping("/salary/predict")
    @Operation(summary = "Predict salary based on skills, city, and experience")
    public ResponseEntity<SalaryPredictionResponse> predictSalary(
            @Valid @RequestBody SalaryPredictionRequest request) {
        return ResponseEntity.ok(aiService.predictSalary(request));
    }

    @PostMapping("/demand/forecast")
    @Operation(summary = "Forecast job demand for a skill over N months")
    public ResponseEntity<DemandForecastResponse> forecastDemand(
            @Valid @RequestBody DemandForecastRequest request) {
        return ResponseEntity.ok(aiService.forecastDemand(request));
    }

    @PostMapping("/coach/chat")
    @Operation(summary = "Chat with AI Career Coach (RAG-powered)")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(aiService.chat(request));
    }
}

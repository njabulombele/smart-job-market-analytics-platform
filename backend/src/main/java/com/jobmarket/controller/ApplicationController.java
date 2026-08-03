package com.jobmarket.controller;

import com.jobmarket.dto.application.ApplicationDto;
import com.jobmarket.dto.application.ApplicationRequest;
import com.jobmarket.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Applications", description = "Job application tracking")
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    @Operation(summary = "Get current user's applications")
    public ResponseEntity<Page<ApplicationDto>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getUserApplications(userDetails.getUsername(), pageable));
    }

    @PostMapping
    @Operation(summary = "Save or apply to a job")
    public ResponseEntity<ApplicationDto> createApplication(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.create(userDetails.getUsername(), request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update application status")
    public ResponseEntity<ApplicationDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.updateStatus(id, status, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a saved application")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        applicationService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}

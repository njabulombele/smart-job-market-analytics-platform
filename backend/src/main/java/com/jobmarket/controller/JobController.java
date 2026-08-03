package com.jobmarket.controller;

import com.jobmarket.dto.job.JobDto;
import com.jobmarket.dto.job.JobFilter;
import com.jobmarket.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Jobs", description = "Search and browse job postings")
public class JobController {

    private final JobService jobService;

    @GetMapping
    @Operation(summary = "List jobs with filters and pagination")
    public ResponseEntity<Page<JobDto>> listJobs(
            JobFilter filter,
            @PageableDefault(size = 20, sort = "postedAt") Pageable pageable) {
        return ResponseEntity.ok(jobService.searchJobs(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job details by ID")
    public ResponseEntity<JobDto> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Full-text search across job titles and descriptions")
    public ResponseEntity<Page<JobDto>> searchJobs(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(jobService.fullTextSearch(q, pageable));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending jobs by view count")
    public ResponseEntity<List<JobDto>> getTrendingJobs(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(jobService.getTrendingJobs(limit));
    }
}

package com.jobmarket.service;

import com.jobmarket.dto.job.JobDto;
import com.jobmarket.dto.job.JobFilter;
import com.jobmarket.entity.Job;
import com.jobmarket.repository.JobRepository;
import com.jobmarket.specification.JobSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    @Cacheable(value = "jobs", key = "#filter.hashCode() + '-' + #pageable.pageNumber")
    public Page<JobDto> searchJobs(JobFilter filter, Pageable pageable) {
        Specification<Job> spec = JobSpecification.build(filter);
        return jobRepository.findAll(spec, pageable).map(this::toDto);
    }

    @Transactional
    public JobDto getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + id));
        jobRepository.incrementViewCount(id);
        return toDto(job);
    }

    @Cacheable(value = "job-search", key = "#query + '-' + #pageable.pageNumber")
    public Page<JobDto> fullTextSearch(String query, Pageable pageable) {
        return jobRepository.fullTextSearch(query, pageable).map(this::toDto);
    }

    @Cacheable(value = "trending-jobs", key = "#limit")
    public List<JobDto> getTrendingJobs(int limit) {
        return jobRepository.findTrending(PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private JobDto toDto(Job job) {
        return new JobDto(
            job.getId(),
            job.getTitle(),
            job.getDescription(),
            job.getCompany() != null ? job.getCompany().getName() : null,
            job.getCompany() != null ? job.getCompany().getLogoUrl() : null,
            job.getLocation() != null ? job.getLocation().getCity() : null,
            job.getLocation() != null ? job.getLocation().getCountry() : null,
            job.getSalaryMin(),
            job.getSalaryMax(),
            job.getSalaryCurrency(),
            job.getJobType(),
            job.getExperienceLevel(),
            job.getRemoteType(),
            job.getSourceUrl(),
            job.getSkills().stream().map(s -> s.getName()).collect(Collectors.toSet()),
            job.getPostedAt(),
            job.getViewCount()
        );
    }
}

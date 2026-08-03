package com.jobmarket.service;

import com.jobmarket.dto.application.ApplicationDto;
import com.jobmarket.dto.application.ApplicationRequest;
import com.jobmarket.entity.Application;
import com.jobmarket.entity.Job;
import com.jobmarket.entity.User;
import com.jobmarket.exception.ResourceNotFoundException;
import com.jobmarket.repository.ApplicationRepository;
import com.jobmarket.repository.JobRepository;
import com.jobmarket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public Page<ApplicationDto> getUserApplications(String email, Pageable pageable) {
        User user = findUser(email);
        return applicationRepository.findByUserId(user.getId(), pageable).map(this::toDto);
    }

    @Transactional
    public ApplicationDto create(String email, ApplicationRequest request) {
        User user = findUser(email);
        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> ResourceNotFoundException.of("Job", request.jobId()));

        if (applicationRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
            throw new IllegalArgumentException("Already saved or applied to this job");
        }

        Application application = Application.builder()
                .user(user)
                .job(job)
                .status(Application.Status.SAVED)
                .notes(request.notes())
                .build();

        return toDto(applicationRepository.save(application));
    }

    @Transactional
    public ApplicationDto updateStatus(Long id, String status, String email) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));

        if (!app.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Not your application");
        }

        app.setStatus(Application.Status.valueOf(status.toUpperCase()));
        return toDto(applicationRepository.save(app));
    }

    @Transactional
    public void delete(Long id, String email) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));

        if (!app.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Not your application");
        }

        applicationRepository.delete(app);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private ApplicationDto toDto(Application app) {
        return new ApplicationDto(
            app.getId(),
            app.getJob().getId(),
            app.getJob().getTitle(),
            app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : null,
            app.getStatus().name(),
            app.getAppliedAt(),
            app.getNotes(),
            app.getCreatedAt()
        );
    }
}

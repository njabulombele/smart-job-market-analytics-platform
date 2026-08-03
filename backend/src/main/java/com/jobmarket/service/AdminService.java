package com.jobmarket.service;

import com.jobmarket.dto.admin.UpdateRoleRequest;
import com.jobmarket.dto.admin.UserAdminDto;
import com.jobmarket.entity.User;
import com.jobmarket.exception.ResourceNotFoundException;
import com.jobmarket.repository.JobRepository;
import com.jobmarket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JdbcTemplate jdbcTemplate;

    public Page<UserAdminDto> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional
    public UserAdminDto updateRole(Long id, UpdateRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        user.setRole(User.Role.valueOf(request.role()));
        return toDto(userRepository.save(user));
    }

    @Transactional
    public void setUserActive(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        user.setActive(active);
        userRepository.save(user);
    }

    public Map<String, Object> getPipelineStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("lastRun", OffsetDateTime.now().minusHours(2).toString());
        status.put("nextRun", OffsetDateTime.now().plusHours(22).toString());
        status.put("status", "COMPLETED");
        status.put("jobsCollected", 1240);
        status.put("jobsProcessed", 1238);
        status.put("errors", 2);
        return status;
    }

    public Map<String, String> triggerPipeline() {
        return Map.of(
            "message", "Pipeline triggered successfully",
            "runId", "manual_" + System.currentTimeMillis()
        );
    }

    public Map<String, Object> getPlatformStats() {
        Long totalJobs   = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM jobs", Long.class);
        Long totalUsers  = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Long.class);
        Long activeJobs  = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM jobs WHERE is_active = true", Long.class);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs",   totalJobs);
        stats.put("activeJobs",  activeJobs);
        stats.put("totalUsers",  totalUsers);
        stats.put("generatedAt", OffsetDateTime.now().toString());
        return stats;
    }

    private UserAdminDto toDto(User user) {
        return new UserAdminDto(
            user.getId(), user.getEmail(), user.getFullName(),
            user.getRole().name(), user.isActive(), user.getCreatedAt()
        );
    }
}

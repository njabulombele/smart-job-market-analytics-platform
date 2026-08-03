package com.jobmarket.specification;

import com.jobmarket.dto.job.JobFilter;
import com.jobmarket.entity.Job;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public final class JobSpecification {

    private JobSpecification() {}

    public static Specification<Job> build(JobFilter filter) {
        return Specification
            .where(isActive())
            .and(hasSkill(filter.skill()))
            .and(hasCity(filter.city()))
            .and(hasCompany(filter.company()))
            .and(hasJobType(filter.jobType()))
            .and(hasExperienceLevel(filter.experienceLevel()))
            .and(hasRemoteType(filter.remoteType()))
            .and(hasSalaryAbove(filter.minSalary()))
            .and(hasSalaryBelow(filter.maxSalary()));
    }

    private static Specification<Job> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    private static Specification<Job> hasSkill(String skill) {
        if (skill == null || skill.isBlank()) return null;
        return (root, query, cb) -> {
            Join<Object, Object> skills = root.join("skills");
            return cb.like(cb.lower(skills.get("name")), "%" + skill.toLowerCase() + "%");
        };
    }

    private static Specification<Job> hasCity(String city) {
        if (city == null || city.isBlank()) return null;
        return (root, query, cb) ->
            cb.like(cb.lower(root.get("location").get("city")), "%" + city.toLowerCase() + "%");
    }

    private static Specification<Job> hasCompany(String company) {
        if (company == null || company.isBlank()) return null;
        return (root, query, cb) ->
            cb.like(cb.lower(root.get("company").get("name")), "%" + company.toLowerCase() + "%");
    }

    private static Specification<Job> hasJobType(String jobType) {
        if (jobType == null || jobType.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("jobType"), jobType);
    }

    private static Specification<Job> hasExperienceLevel(String level) {
        if (level == null || level.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("experienceLevel"), level);
    }

    private static Specification<Job> hasRemoteType(String remoteType) {
        if (remoteType == null || remoteType.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("remoteType"), remoteType);
    }

    private static Specification<Job> hasSalaryAbove(java.math.BigDecimal min) {
        if (min == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("salaryMax"), min);
    }

    private static Specification<Job> hasSalaryBelow(java.math.BigDecimal max) {
        if (max == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("salaryMin"), max);
    }
}

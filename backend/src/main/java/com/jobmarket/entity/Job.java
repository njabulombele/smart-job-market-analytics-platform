package com.jobmarket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency;
    private String jobType;
    private String experienceLevel;
    private String remoteType;
    private String sourceUrl;
    private String sourceName;
    private String externalId;
    private OffsetDateTime postedAt;

    @Column(nullable = false)
    private OffsetDateTime collectedAt;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private int viewCount = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "job_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @PrePersist
    void prePersist() {
        collectedAt = OffsetDateTime.now();
    }
}

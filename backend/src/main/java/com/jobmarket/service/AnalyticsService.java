package com.jobmarket.service;

import com.jobmarket.dto.analytics.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final JdbcTemplate jdbcTemplate;

    @Cacheable(value = "top-skills", key = "#limit")
    public List<SkillDemandDto> getTopSkills(int limit) {
        String sql = """
            SELECT s.name, s.category, COUNT(js.job_id) AS job_count
            FROM skills s
            JOIN job_skills js ON js.skill_id = s.id
            JOIN jobs j ON j.id = js.job_id
            WHERE j.is_active = true
            GROUP BY s.id, s.name, s.category
            ORDER BY job_count DESC
            LIMIT ?
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new SkillDemandDto(
                rs.getString("name"),
                rs.getString("category"),
                rs.getLong("job_count"),
                0.0
            ), limit);
    }

    @Cacheable(value = "top-locations", key = "#limit")
    public List<LocationDemandDto> getTopLocations(int limit) {
        String sql = """
            SELECT l.city, l.country, COUNT(j.id) AS job_count,
                   AVG((j.salary_min + j.salary_max) / 2) AS avg_salary
            FROM locations l
            JOIN jobs j ON j.location_id = l.id
            WHERE j.is_active = true
            GROUP BY l.id, l.city, l.country
            ORDER BY job_count DESC
            LIMIT ?
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new LocationDemandDto(
                rs.getString("city"),
                rs.getString("country"),
                rs.getLong("job_count"),
                rs.getDouble("avg_salary")
            ), limit);
    }

    @Cacheable(value = "salary-stats", key = "#skill + '-' + #city")
    public SalaryStatsDto getSalaryStats(String skill, String city) {
        String sql = """
            SELECT
                MIN(j.salary_min) AS min_sal,
                MAX(j.salary_max) AS max_sal,
                AVG((j.salary_min + j.salary_max) / 2) AS avg_sal,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (j.salary_min + j.salary_max) / 2) AS median_sal,
                COUNT(*) AS sample_size
            FROM jobs j
            LEFT JOIN job_skills js ON js.job_id = j.id
            LEFT JOIN skills s ON s.id = js.skill_id
            LEFT JOIN locations l ON l.id = j.location_id
            WHERE j.is_active = true
              AND j.salary_min IS NOT NULL
              AND (? IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', ?, '%')))
              AND (? IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', ?, '%')))
            """;
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
            new SalaryStatsDto(
                skill, city,
                rs.getBigDecimal("min_sal"),
                rs.getBigDecimal("max_sal"),
                rs.getBigDecimal("avg_sal"),
                rs.getBigDecimal("median_sal"),
                rs.getLong("sample_size")
            ), skill, skill, city, city);
    }

    @Cacheable(value = "demand-trends", key = "#skill + '-' + #months")
    public List<TrendDataDto> getDemandTrend(String skill, int months) {
        String sql = """
            SELECT TO_CHAR(DATE_TRUNC('month', j.posted_at), 'YYYY-MM') AS period,
                   COUNT(j.id) AS job_count
            FROM jobs j
            JOIN job_skills js ON js.job_id = j.id
            JOIN skills s ON s.id = js.skill_id
            WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', ?, '%'))
              AND j.posted_at >= NOW() - INTERVAL '1 month' * ?
            GROUP BY period
            ORDER BY period ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new TrendDataDto(rs.getString("period"), rs.getLong("job_count"), 0.0),
            skill, months);
    }
}

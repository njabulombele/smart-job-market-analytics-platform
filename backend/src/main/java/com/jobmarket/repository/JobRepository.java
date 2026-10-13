package com.jobmarket.repository;

import com.jobmarket.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>,
                                        JpaSpecificationExecutor<Job> {

    @Query(value = """
        SELECT j.* FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        LEFT JOIN locations l ON j.location_id = l.id
        WHERE j.is_active = true
        AND (to_tsvector('english', j.title || ' ' || COALESCE(j.description, ''))
             @@ plainto_tsquery('english', :query))
        """,
        countQuery = """
        SELECT COUNT(*) FROM jobs j
        WHERE j.is_active = true
        AND (to_tsvector('english', j.title || ' ' || COALESCE(j.description, ''))
             @@ plainto_tsquery('english', :query))
        """,
        nativeQuery = true)
    Page<Job> fullTextSearch(@Param("query") String query, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.isActive = true ORDER BY j.viewCount DESC")
    List<Job> findTrending(Pageable pageable);

    @Modifying
    @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :id")
    void incrementViewCount(@Param("id") Long id);
}

package com.jobmarket.controller;

import com.jobmarket.dto.job.JobDto;
import com.jobmarket.service.JobService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobController.class)
class JobControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean JobService jobService;

    @Test
    @WithMockUser
    void listJobs_returns200() throws Exception {
        when(jobService.searchJobs(any(), any()))
            .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/v1/jobs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @WithMockUser
    void getTrending_returns200() throws Exception {
        when(jobService.getTrendingJobs(anyInt())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/jobs/trending"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
}

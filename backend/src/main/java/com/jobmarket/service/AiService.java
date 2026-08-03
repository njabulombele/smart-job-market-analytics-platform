package com.jobmarket.service;

import com.jobmarket.dto.ai.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public ResumeMatchResponse matchResume(MultipartFile resumeFile, Long jobId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("resume", new ByteArrayResource(resumeFile.getBytes()) {
                @Override
                public String getFilename() { return resumeFile.getOriginalFilename(); }
            });
            body.add("job_id", jobId.toString());

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<ResumeMatchResponse> response = restTemplate.postForEntity(
                mlServiceUrl + "/api/resume/match", request, ResumeMatchResponse.class);

            return response.getBody();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read resume file", e);
        }
    }

    public SalaryPredictionResponse predictSalary(SalaryPredictionRequest request) {
        ResponseEntity<SalaryPredictionResponse> response = restTemplate.postForEntity(
            mlServiceUrl + "/api/salary/predict", request, SalaryPredictionResponse.class);
        return response.getBody();
    }

    public DemandForecastResponse forecastDemand(DemandForecastRequest request) {
        ResponseEntity<DemandForecastResponse> response = restTemplate.postForEntity(
            mlServiceUrl + "/api/demand/forecast", request, DemandForecastResponse.class);
        return response.getBody();
    }

    public ChatResponse chat(ChatRequest request) {
        long start = System.currentTimeMillis();
        ResponseEntity<ChatResponse> response = restTemplate.postForEntity(
            mlServiceUrl + "/api/coach/chat", request, ChatResponse.class);
        long elapsed = System.currentTimeMillis() - start;
        log.debug("AI coach response time: {}ms", elapsed);
        return response.getBody();
    }
}

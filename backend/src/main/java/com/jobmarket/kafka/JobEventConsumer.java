package com.jobmarket.kafka;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class JobEventConsumer {

    @KafkaListener(topics = "job.processed", groupId = "jobmarket-backend")
    public void handleJobProcessed(Map<String, Object> event) {
        log.info("Received job.processed event: jobId={}", event.get("jobId"));
    }

    @KafkaListener(topics = "pipeline.alerts", groupId = "jobmarket-backend")
    public void handlePipelineAlert(Map<String, Object> event) {
        String severity = (String) event.getOrDefault("severity", "INFO");
        String message  = (String) event.getOrDefault("message", "");
        log.warn("Pipeline alert [{}]: {}", severity, message);
    }
}

package com.jobmarket.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishJobCollected(Long jobId, String sourceName) {
        Map<String, Object> event = Map.of(
            "jobId", jobId,
            "source", sourceName,
            "eventType", "JOB_COLLECTED",
            "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("job.raw.collected", String.valueOf(jobId), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish job.raw.collected for jobId={}", jobId, ex);
                    } else {
                        log.debug("Published job.raw.collected for jobId={}", jobId);
                    }
                });
    }

    public void publishSkillDemandUpdated(String skillName, long jobCount) {
        Map<String, Object> event = Map.of(
            "skill", skillName,
            "jobCount", jobCount,
            "eventType", "SKILL_DEMAND_UPDATED",
            "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("skill.demand.updated", skillName, event);
    }

    public void publishPipelineAlert(String message, String severity) {
        Map<String, Object> event = Map.of(
            "message", message,
            "severity", severity,
            "eventType", "PIPELINE_ALERT",
            "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("pipeline.alerts", "alert", event);
    }
}

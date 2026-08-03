package com.jobmarket.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    @Bean
    public NewTopic jobRawCollected() {
        return TopicBuilder.name("job.raw.collected")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic jobProcessed() {
        return TopicBuilder.name("job.processed")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic skillDemandUpdated() {
        return TopicBuilder.name("skill.demand.updated")
                .partitions(2)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic pipelineAlerts() {
        return TopicBuilder.name("pipeline.alerts")
                .partitions(1)
                .replicas(1)
                .build();
    }
}

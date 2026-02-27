package com.greencampus.config;

import com.greencampus.service.chat.GroqClient;
import com.greencampus.service.chat.HttpGroqClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class ChatConfig {

    @Bean
    public RestTemplate groqRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(20))
                .setReadTimeout(Duration.ofSeconds(20))
                .build();
    }

    @Bean
    public GroqClient groqClient(
            RestTemplate groqRestTemplate,
            ObjectMapper objectMapper,
            @Value("${GROQ_API_KEY:}") String groqApiKey,
            @Value("${GROQ_MODEL_NAME:llama3-8b-8192}") String groqModelName) {
        return new HttpGroqClient(groqRestTemplate, objectMapper, groqApiKey, groqModelName);
    }
}

package com.greencampus.service.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
public class HttpGroqClient implements GroqClient {

    private static final String GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String modelName;

    public HttpGroqClient(RestTemplate restTemplate, ObjectMapper objectMapper, String apiKey, String modelName) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.modelName = (modelName == null || modelName.isBlank()) ? "llama3-8b-8192" : modelName;
    }

    @Override
    public String complete(String systemMessage, String developerMessage, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GROQ_API_KEY not configured");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> payload = Map.of(
                "model", modelName,
                "temperature", 0.1,
                "max_tokens", 320,
                "messages", List.of(
                        Map.of("role", "system", "content", systemMessage),
                        Map.of("role", "developer", "content", developerMessage),
                        Map.of("role", "user", "content", userMessage)));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        RestClientException last = null;
        for (int attempt = 0; attempt < 2; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(GROQ_ENDPOINT, request, String.class);
                return extractContent(response.getBody());
            } catch (RestClientException ex) {
                last = ex;
                log.warn("Groq call failed (attempt {}/2): {}", attempt + 1, ex.getMessage());
            }
        }
        throw last == null ? new RuntimeException("Groq call failed") : last;
    }

    private String extractContent(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                return "";
            }
            return choices.get(0).path("message").path("content").asText("").trim();
        } catch (Exception e) {
            throw new RuntimeException("Unable to parse Groq response", e);
        }
    }
}

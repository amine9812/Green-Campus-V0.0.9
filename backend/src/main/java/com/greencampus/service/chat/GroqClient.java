package com.greencampus.service.chat;

public interface GroqClient {
    String complete(String systemMessage, String developerMessage, String userMessage);
}

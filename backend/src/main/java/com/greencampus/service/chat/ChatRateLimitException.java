package com.greencampus.service.chat;

public class ChatRateLimitException extends RuntimeException {
    public ChatRateLimitException(String message) {
        super(message);
    }
}

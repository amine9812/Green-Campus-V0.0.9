package com.greencampus.service.chat;

public class InvalidChatInputException extends RuntimeException {
    public InvalidChatInputException(String message) {
        super(message);
    }
}

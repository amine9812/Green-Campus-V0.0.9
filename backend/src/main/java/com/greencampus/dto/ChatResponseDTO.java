package com.greencampus.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatResponseDTO {
    private String answer;
    private String conversationId;
}

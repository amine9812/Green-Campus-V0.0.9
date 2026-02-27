package com.greencampus.service.chat;

import java.util.Map;

public record ChatContextResult(
        Map<String, Object> context,
        String contextJson,
        boolean hasFacts) {
}

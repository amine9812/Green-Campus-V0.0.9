package com.greencampus.controller;

import com.greencampus.dto.ChatRequestDTO;
import com.greencampus.dto.ChatResponseDTO;
import com.greencampus.security.AuthContext;
import com.greencampus.security.AuthenticatedUser;
import com.greencampus.service.chat.ChatRateLimitException;
import com.greencampus.service.chat.ChatService;
import com.greencampus.service.chat.InvalidChatInputException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<?> chat(
            @RequestBody ChatRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String auth,
            HttpServletRequest servletRequest) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            String answer = chatService.answer(request.getMessage(), user, extractClientIp(servletRequest));
            return ResponseEntity.ok(new ChatResponseDTO(answer, request.getConversationId()));
        } catch (InvalidChatInputException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (ChatRateLimitException ex) {
            return ResponseEntity.status(429).body(Map.of("error", ex.getMessage()));
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

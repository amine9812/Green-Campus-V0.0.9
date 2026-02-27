package com.greencampus.service.chat;

import com.greencampus.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    public static final String FALLBACK = "Information not available in the system.";
    private static final String SYSTEM_MESSAGE =
            "Answer ONLY from the provided CONTEXT block. If missing, reply 'Information not available in the system.'";

    private final ChatContextBuilder contextBuilder;
    private final GroqClient groqClient;
    private final AnswerVerifier answerVerifier;
    private final ChatRateLimiter chatRateLimiter;

    public String answer(String rawMessage, AuthenticatedUser user, String ipAddress) {
        if (user == null) {
            throw new InvalidChatInputException("Authentication required");
        }
        if (!chatRateLimiter.allowUser(user.username()) || !chatRateLimiter.allowIp(ipAddress)) {
            throw new ChatRateLimitException("Rate limit exceeded");
        }

        String message = sanitize(rawMessage);
        validate(message);
        boolean suspiciousPrompt = looksLikePromptInjection(message);

        log.info("Chat request user={} role={} ip={} q='{}'",
                user.username(), user.role().name(), ipAddress, truncateForLog(message));
        if (suspiciousPrompt) {
            log.warn("Potential prompt injection pattern detected for user={}", user.username());
        }

        ChatContextResult context = contextBuilder.build(message, user);
        if (!context.hasFacts()) {
            return FALLBACK;
        }

        String developerMessage = """
                CONTEXT:
                %s

                Rules:
                - Use ONLY facts in CONTEXT.
                - If user asks for something not in CONTEXT, reply exactly: Information not available in the system.
                - Do not add external knowledge.
                - Do not guess.
                """.formatted(context.contextJson());

        String answer;
        try {
            answer = groqClient.complete(SYSTEM_MESSAGE, developerMessage, message);
        } catch (Exception ex) {
            log.warn("Chat LLM unavailable: {}", ex.getMessage());
            return FALLBACK;
        }

        if (answer == null || answer.isBlank()) {
            return FALLBACK;
        }

        if (suspiciousPrompt && !context.hasFacts()) {
            return FALLBACK;
        }

        if (!answerVerifier.isSupportedByContext(answer, context.contextJson(), FALLBACK)) {
            return FALLBACK;
        }

        return answer.trim();
    }

    String sanitize(String raw) {
        if (raw == null) {
            return "";
        }
        String stripped = raw.replaceAll("[\\p{Cntrl}&&[^\\n\\t]]", " ");
        return stripped.trim();
    }

    void validate(String message) {
        if (message.isBlank()) {
            throw new InvalidChatInputException("Message is required");
        }
        if (message.length() > 500) {
            throw new InvalidChatInputException("Message too long (max 500 chars)");
        }
    }

    private String truncateForLog(String message) {
        if (message.length() <= 120) {
            return message;
        }
        return message.substring(0, 120) + "...";
    }

    public boolean looksLikePromptInjection(String message) {
        String q = message.toLowerCase(Locale.ROOT);
        return q.contains("ignore previous")
                || q.contains("system prompt")
                || q.contains("browse")
                || q.contains("tool")
                || q.contains("web");
    }
}

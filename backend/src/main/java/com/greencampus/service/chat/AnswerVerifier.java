package com.greencampus.service.chat;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AnswerVerifier {

    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\b\\d+(?:[.,]\\d+)?\\b");
    private static final Pattern ROOM_CODE_PATTERN = Pattern.compile("\\b([A-Z]{1,5}-?[A-Z]?\\d{1,3})\\b");
    private static final Pattern STATUS_PATTERN = Pattern.compile("\\b(OPEN|CLOSED|BROKEN|WORKING|IN_PROGRESS|RESOLVED|P1|P2|P3)\\b", Pattern.CASE_INSENSITIVE);

    private static final Set<String> BLOCKED_MARKERS = Set.of(
            "http",
            "www",
            "according to",
            "internet",
            "web",
            "wikipedia",
            "google");

    public boolean isSupportedByContext(String answer, String contextJson, String fallbackSentence) {
        if (answer == null || answer.isBlank()) {
            return false;
        }
        if (fallbackSentence.equals(answer.trim())) {
            return true;
        }

        String answerNorm = answer.toLowerCase(Locale.ROOT);
        String contextNorm = contextJson == null ? "" : contextJson.toLowerCase(Locale.ROOT);

        for (String marker : BLOCKED_MARKERS) {
            if (answerNorm.contains(marker)) {
                return false;
            }
        }

        if (!containsAll(NUMBER_PATTERN, answer, contextNorm, false)) {
            return false;
        }
        if (!containsAll(ROOM_CODE_PATTERN, answer.toUpperCase(Locale.ROOT), contextNorm, true)) {
            return false;
        }
        if (!containsAll(STATUS_PATTERN, answer.toUpperCase(Locale.ROOT), contextNorm, true)) {
            return false;
        }

        if (answerNorm.contains("not sure") || answerNorm.contains("i think") || answerNorm.contains("maybe")) {
            return false;
        }

        return true;
    }

    private boolean containsAll(Pattern pattern, String source, String contextNorm, boolean uppercase) {
        Matcher matcher = pattern.matcher(source);
        while (matcher.find()) {
            String token = matcher.groupCount() >= 1 ? matcher.group(1) : matcher.group();
            String probe = uppercase ? token.toUpperCase(Locale.ROOT).toLowerCase(Locale.ROOT) : token.toLowerCase(Locale.ROOT);
            if (!contextNorm.contains(probe)) {
                return false;
            }
        }
        return true;
    }
}

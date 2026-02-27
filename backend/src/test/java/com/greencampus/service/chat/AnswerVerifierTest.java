package com.greencampus.service.chat;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AnswerVerifierTest {

    private final AnswerVerifier verifier = new AnswerVerifier();

    @Test
    void acceptsAnswerWhenFactsAreInContext() {
        String context = "{\"roomCode\":\"A1\",\"workingPcs\":20,\"status\":\"OPEN\"}";
        String answer = "Room A1 is OPEN with 20 working PCs.";
        assertTrue(verifier.isSupportedByContext(answer, context, ChatService.FALLBACK));
    }

    @Test
    void rejectsOutOfContextFacts() {
        String context = "{\"roomCode\":\"A1\",\"workingPcs\":20}";
        String answer = "Room A1 has 42 working PCs.";
        assertFalse(verifier.isSupportedByContext(answer, context, ChatService.FALLBACK));
    }

    @Test
    void rejectsExternalMarkers() {
        String context = "{\"roomCode\":\"A1\"}";
        String answer = "According to the internet, room A1 is best.";
        assertFalse(verifier.isSupportedByContext(answer, context, ChatService.FALLBACK));
    }
}

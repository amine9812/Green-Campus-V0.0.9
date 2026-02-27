package com.greencampus.controller;

import com.greencampus.service.chat.GroqClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ChatControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GroqClient groqClient;

    private String token;

    @BeforeEach
    void loginAsAdmin() throws Exception {
        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        token = loginResponse.replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
    }

    @Test
    void requiresAuth() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"hello\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validatesInput() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsFallbackWhenVerifierRejects() throws Exception {
        when(groqClient.complete(anyString(), anyString(), anyString()))
                .thenReturn("Room A1 has 999 working PCs according to internet.");

        mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"How many working pcs in A1?\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("Information not available in the system."));
    }

    @Test
    void returnsAnswerWhenVerifierAccepts() throws Exception {
        when(groqClient.complete(anyString(), anyString(), anyString()))
                .thenReturn("Room A1 is OPEN with 20 working PCs.");

        mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Tell me about room A1 status\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").isString());
    }

    @Test
    void enforcesRateLimit() throws Exception {
        when(groqClient.complete(anyString(), anyString(), anyString()))
                .thenReturn("Information not available in the system.");

        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/chat")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"message\":\"hello " + i + "\"}"))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"hello 11\"}"))
                .andExpect(status().isTooManyRequests());
    }
}

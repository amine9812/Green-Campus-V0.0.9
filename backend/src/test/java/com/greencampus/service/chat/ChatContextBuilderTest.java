package com.greencampus.service.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greencampus.dto.RoomListDTO;
import com.greencampus.dto.TicketDTO;
import com.greencampus.model.enums.RoomStatus;
import com.greencampus.model.enums.RoomType;
import com.greencampus.model.enums.TicketPriority;
import com.greencampus.model.enums.TicketStatus;
import com.greencampus.model.enums.UserRole;
import com.greencampus.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

class ChatContextBuilderTest {

    private ChatDataAdapter adapter;
    private ChatContextBuilder builder;

    @BeforeEach
    void setUp() {
        adapter = Mockito.mock(ChatDataAdapter.class);
        builder = new ChatContextBuilder(adapter, new ObjectMapper());

        RoomListDTO room = RoomListDTO.builder()
                .id(1L)
                .code("A1")
                .type(RoomType.CLASS)
                .status(RoomStatus.OPEN)
                .capacity(40)
                .workingPcs(20)
                .brokenPcs(1)
                .build();

        TicketDTO ticket = TicketDTO.builder()
                .id(10L)
                .roomCode("A1")
                .title("Projector broken")
                .priority(TicketPriority.P1)
                .status(TicketStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        Mockito.when(adapter.listRooms(any())).thenReturn(List.of(room));
        Mockito.when(adapter.searchAvailableRooms(any(), any())).thenReturn(List.of(room));
        Mockito.when(adapter.getTickets(any())).thenReturn(List.of(ticket));
        Mockito.when(adapter.getPoliciesSummary()).thenReturn(Map.of("dataSource", "Internal"));
        Mockito.when(adapter.getRoomByCodeOrId(anyString())).thenReturn(Optional.empty());
        Mockito.when(adapter.getOpenTickets(any())).thenReturn(List.of(ticket));
        Mockito.when(adapter.getSessions()).thenReturn(List.of());
        Mockito.when(adapter.suggestFreeRooms(any(), any(), any())).thenReturn(List.of());
    }

    @Test
    void keepsOnlyAllowedKeysAndNoPii() {
        ChatContextResult result = builder.build(
                "Which rooms are available today?",
                new AuthenticatedUser("admin", UserRole.ADMIN));

        assertTrue(result.context().containsKey("timeNow"));
        assertTrue(result.context().containsKey("userRole"));
        assertTrue(result.context().containsKey("questionIntent"));
        assertTrue(result.context().containsKey("availableRooms") || result.context().containsKey("rooms"));

        String json = result.contextJson().toLowerCase();
        assertFalse(json.contains("password"));
        assertFalse(json.contains("token"));
        assertFalse(json.contains("email"));
    }
}

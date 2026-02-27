package com.greencampus.service.chat;

import com.greencampus.dto.FreeRoomDTO;
import com.greencampus.dto.RoomDetailDTO;
import com.greencampus.dto.RoomListDTO;
import com.greencampus.dto.SessionDTO;
import com.greencampus.dto.TicketDTO;
import com.greencampus.model.enums.DayOfWeekEnum;
import com.greencampus.model.enums.RoomStatus;
import com.greencampus.service.AbsenceService;
import com.greencampus.service.RoomService;
import com.greencampus.service.SessionService;
import com.greencampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ChatDataAdapter {

    private final RoomService roomService;
    private final TicketService ticketService;
    private final SessionService sessionService;
    private final AbsenceService absenceService;

    public Optional<RoomDetailDTO> getRoomByCodeOrId(String codeOrId) {
        if (codeOrId == null || codeOrId.isBlank()) {
            return Optional.empty();
        }

        try {
            Long roomId = Long.parseLong(codeOrId);
            return Optional.ofNullable(roomService.getRoomDetail(roomId));
        } catch (Exception ignored) {
            // Try by code below
        }

        return roomService.searchRooms(codeOrId, null, null, null, null).stream()
                .filter(r -> r.getCode().equalsIgnoreCase(codeOrId))
                .findFirst()
                .map(RoomListDTO::getId)
                .map(roomService::getRoomDetail);
    }

    public List<RoomListDTO> searchAvailableRooms(Integer minWorkingPcs, Boolean needsProjector) {
        return roomService.searchRooms(null, null, RoomStatus.OPEN, minWorkingPcs, needsProjector);
    }

    public List<RoomListDTO> listRooms(String q) {
        return roomService.searchRooms(q, null, null, null, null);
    }

    public List<TicketDTO> getOpenTickets(Long roomId) {
        return ticketService.searchTickets(com.greencampus.model.enums.TicketStatus.OPEN, null, roomId);
    }

    public List<TicketDTO> getTickets(Long roomId) {
        return ticketService.searchTickets(null, null, roomId);
    }

    public List<SessionDTO> getSessions() {
        return sessionService.getAllSessions();
    }

    public List<SessionDTO> getRoomSessions(Long roomId) {
        return sessionService.getSessionsByRoom(roomId);
    }

    public List<FreeRoomDTO> suggestFreeRooms(DayOfWeekEnum day, LocalTime start, LocalTime end) {
        return absenceService.suggestFreeRooms(day, start, end);
    }

    public Map<String, Object> getPoliciesSummary() {
        return Map.of(
                "fallbackSentence", ChatService.FALLBACK,
                "ticketCreate", "TECHNICIAN only",
                "ticketDelete", "ADMIN only",
                "roomsWrite", "ADMIN only",
                "dataSource", "Internal GreenCampus services only");
    }
}

package com.greencampus.service.chat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greencampus.dto.FreeRoomDTO;
import com.greencampus.dto.RoomDetailDTO;
import com.greencampus.dto.RoomListDTO;
import com.greencampus.dto.SessionDTO;
import com.greencampus.dto.TicketDTO;
import com.greencampus.model.enums.DayOfWeekEnum;
import com.greencampus.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class ChatContextBuilder {

    private static final Pattern ROOM_CODE_PATTERN = Pattern.compile("\\b([A-Z]{1,5}-?[A-Z]?\\d{1,3}|\\d{1,4})\\b");

    private final ChatDataAdapter chatDataAdapter;
    private final ObjectMapper objectMapper;

    public ChatContextResult build(String question, AuthenticatedUser user) {
        String intent = detectIntent(question);
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("timeNow", LocalDateTime.now().toString());
        context.put("userRole", user != null ? user.role().name() : null);
        context.put("questionIntent", intent);

        boolean hasFacts = false;

        String roomHint = extractRoomHint(question);
        if (roomHint != null) {
            Optional<RoomDetailDTO> roomDetail = chatDataAdapter.getRoomByCodeOrId(roomHint);
            if (roomDetail.isPresent()) {
                context.put("roomDetail", summarizeRoomDetail(roomDetail.get()));
                context.put("roomAssets", summarizeAssets(roomDetail.get()));
                context.put("roomSessions", summarizeSessions(chatDataAdapter.getRoomSessions(roomDetail.get().getId()), 6));
                context.put("roomTickets", summarizeTickets(chatDataAdapter.getTickets(roomDetail.get().getId()), 6));
                hasFacts = true;
            }
        }

        if ("availability".equals(intent)) {
            List<RoomListDTO> available = chatDataAdapter.searchAvailableRooms(null, null);
            context.put("availableRooms", summarizeRooms(available, 12));
            hasFacts = hasFacts || !available.isEmpty();

            try {
                DayOfWeekEnum day = DayOfWeekEnum.valueOf(java.time.LocalDate.now().getDayOfWeek().name());
                LocalTime now = LocalTime.now();
                List<FreeRoomDTO> freeRooms = chatDataAdapter.suggestFreeRooms(day, now, now.plusHours(1));
                context.put("freeRoomSuggestions", summarizeFreeRooms(freeRooms, 8));
                hasFacts = hasFacts || !freeRooms.isEmpty();
            } catch (Exception ignored) {
                context.put("freeRoomSuggestions", List.of());
            }
        }

        if ("assets".equals(intent)) {
            List<RoomListDTO> rooms = chatDataAdapter.listRooms(null);
            context.put("assetsSummary", summarizeAssetHealth(rooms, 15));
            hasFacts = hasFacts || !rooms.isEmpty();
        }

        if ("tickets".equals(intent)) {
            List<TicketDTO> tickets = chatDataAdapter.getTickets(null);
            context.put("ticketsSummary", summarizeTickets(tickets, 20));
            hasFacts = hasFacts || !tickets.isEmpty();
        }

        if ("general_policy".equals(intent)) {
            context.put("policySummary", chatDataAdapter.getPoliciesSummary());
            hasFacts = true;
        }

        if (!hasFacts) {
            // Keep compact fallback context for strict answers.
            context.put("rooms", summarizeRooms(chatDataAdapter.listRooms(null), 8));
            context.put("ticketsSummary", summarizeTickets(chatDataAdapter.getTickets(null), 8));
            hasFacts = !((List<?>) context.get("rooms")).isEmpty() || !((List<?>) context.get("ticketsSummary")).isEmpty();
        }

        String contextJson;
        try {
            contextJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);
        } catch (JsonProcessingException e) {
            contextJson = "{}";
        }

        return new ChatContextResult(context, contextJson, hasFacts);
    }

    private String detectIntent(String question) {
        String q = question == null ? "" : question.toLowerCase(Locale.ROOT);
        if (q.matches(".*(available|free|disponibil|slot|demain|tomorrow|today|date|time).*")) {
            return "availability";
        }
        if (q.matches(".*(pc|pcs|projector|projecteur|equipment|broken|cass[ée]|panne).*")) {
            return "assets";
        }
        if (q.matches(".*(ticket|incident|maintenance).*")) {
            return "tickets";
        }
        if (q.matches(".*(how|policy|rule|permissions|role).*")) {
            return "general_policy";
        }
        if (extractRoomHint(question) != null) {
            return "room_detail";
        }
        return "unknown";
    }

    private String extractRoomHint(String question) {
        if (question == null) {
            return null;
        }
        Matcher matcher = ROOM_CODE_PATTERN.matcher(question.toUpperCase(Locale.ROOT));
        while (matcher.find()) {
            String token = matcher.group(1);
            if (token != null && !token.isBlank()) {
                return token;
            }
        }
        return null;
    }

    private List<Map<String, Object>> summarizeRooms(List<RoomListDTO> rooms, int max) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (RoomListDTO room : rooms.stream().limit(max).toList()) {
            out.add(Map.of(
                    "id", room.getId(),
                    "code", room.getCode(),
                    "type", room.getType().name(),
                    "status", room.getStatus().name(),
                    "capacity", room.getCapacity(),
                    "workingPcs", room.getWorkingPcs(),
                    "brokenPcs", room.getBrokenPcs(),
                    "projectorStatus", room.getProjectorStatus() == null ? "UNKNOWN" : room.getProjectorStatus().name()));
        }
        return out;
    }

    private Map<String, Object> summarizeRoomDetail(RoomDetailDTO room) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", room.getId());
        out.put("code", room.getCode());
        out.put("type", room.getType().name());
        out.put("status", room.getStatus().name());
        out.put("capacity", room.getCapacity());
        out.put("totalTables", room.getTotalTables());
        out.put("tablesHavePcs", room.isTablesHavePcs());
        out.put("workingPcs", room.getWorkingPcs());
        out.put("brokenPcs", room.getBrokenPcs());
        out.put("projectorStatus", room.getProjectorStatus() == null ? "UNKNOWN" : room.getProjectorStatus().name());
        out.put("teacherPcStatus", room.getTeacherPcStatus() == null ? "UNKNOWN" : room.getTeacherPcStatus().name());
        return out;
    }

    private List<Map<String, Object>> summarizeAssets(RoomDetailDTO room) {
        List<Map<String, Object>> assets = new ArrayList<>();
        room.getAssets().stream().limit(40).forEach(a -> assets.add(Map.of(
                "label", a.getLabel(),
                "type", a.getType().name(),
                "status", a.getStatus().name(),
                "tableIndex", a.getTableIndex() == null ? 0 : a.getTableIndex())));
        return assets;
    }

    private List<Map<String, Object>> summarizeTickets(List<TicketDTO> tickets, int max) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (TicketDTO t : tickets.stream().limit(max).toList()) {
            out.add(Map.of(
                    "id", t.getId(),
                    "roomCode", t.getRoomCode(),
                    "title", t.getTitle(),
                    "priority", t.getPriority().name(),
                    "status", t.getStatus().name(),
                    "createdAt", t.getCreatedAt().toString()));
        }
        return out;
    }

    private List<Map<String, Object>> summarizeSessions(List<SessionDTO> sessions, int max) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (SessionDTO s : sessions.stream().limit(max).toList()) {
            out.add(Map.of(
                    "roomCode", s.getRoomCode(),
                    "courseName", s.getCourseName(),
                    "dayOfWeek", s.getDayOfWeek().name(),
                    "startTime", s.getStartTime(),
                    "endTime", s.getEndTime()));
        }
        return out;
    }

    private List<Map<String, Object>> summarizeAssetHealth(List<RoomListDTO> rooms, int max) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (RoomListDTO room : rooms.stream().limit(max).toList()) {
            out.add(Map.of(
                    "roomCode", room.getCode(),
                    "projectorStatus", room.getProjectorStatus() == null ? "UNKNOWN" : room.getProjectorStatus().name(),
                    "teacherPcStatus", room.getTeacherPcStatus() == null ? "UNKNOWN" : room.getTeacherPcStatus().name(),
                    "workingPcs", room.getWorkingPcs(),
                    "brokenPcs", room.getBrokenPcs()));
        }
        return out;
    }

    private List<Map<String, Object>> summarizeFreeRooms(List<FreeRoomDTO> freeRooms, int max) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (FreeRoomDTO free : freeRooms.stream().limit(max).toList()) {
            out.add(Map.of(
                    "roomId", free.getRoomId(),
                    "roomCode", free.getRoomCode(),
                    "roomType", free.getRoomType(),
                    "capacity", free.getCapacity(),
                    "reason", free.getReason()));
        }
        return out;
    }
}

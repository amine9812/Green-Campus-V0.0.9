package com.greencampus.controller;

import com.greencampus.model.enums.AssetStatus;
import com.greencampus.model.enums.AssetType;
import com.greencampus.model.enums.TicketStatus;
import com.greencampus.security.AuthContext;
import com.greencampus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final RoomRepository roomRepository;
    private final AssetRepository assetRepository;
    private final TicketRepository ticketRepository;
    private final SessionRepository sessionRepository;

    @GetMapping
    public ResponseEntity<?> getStats(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (AuthContext.fromAuthorizationHeader(auth) == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        long totalRooms = roomRepository.count();
        long openTickets = ticketRepository.countByStatusNot(TicketStatus.RESOLVED);
        long brokenPcs = assetRepository.countByTypeAndStatus(AssetType.TABLE_PC, AssetStatus.BROKEN);
        long totalSessions = sessionRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalRooms", totalRooms,
                "openTickets", openTickets,
                "brokenPcs", brokenPcs,
                "totalSessions", totalSessions));
    }
}

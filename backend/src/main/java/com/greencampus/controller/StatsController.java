package com.greencampus.controller;

import com.greencampus.model.enums.AssetStatus;
import com.greencampus.model.enums.AssetType;
import com.greencampus.model.enums.TicketStatus;
import com.greencampus.repository.*;
import lombok.RequiredArgsConstructor;
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
    public Map<String, Object> getStats() {
        long totalRooms = roomRepository.count();
        long openTickets = ticketRepository.countByStatusNot(TicketStatus.RESOLVED);
        long brokenPcs = assetRepository.countByTypeAndStatus(AssetType.TABLE_PC, AssetStatus.BROKEN);
        long totalSessions = sessionRepository.count();

        return Map.of(
                "totalRooms", totalRooms,
                "openTickets", openTickets,
                "brokenPcs", brokenPcs,
                "totalSessions", totalSessions);
    }
}

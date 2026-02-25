package com.greencampus.controller;

import com.greencampus.dto.SessionDTO;
import com.greencampus.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public List<SessionDTO> getAll() {
        return sessionService.getAllSessions();
    }

    @GetMapping("/room/{roomId}")
    public List<SessionDTO> getByRoom(@PathVariable Long roomId) {
        return sessionService.getSessionsByRoom(roomId);
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importCsv(@RequestParam("file") MultipartFile file) {
        try {
            int count = sessionService.importCsv(file.getInputStream());
            return ResponseEntity.ok(Map.of("imported", count, "status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<Void> clearRoom(@PathVariable Long roomId) {
        sessionService.clearRoomSessions(roomId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/occupancy")
    public ResponseEntity<Map<String, Long>> occupancy() {
        return ResponseEntity.ok(Map.of("occupiedRooms", sessionService.countOccupiedNow()));
    }
}

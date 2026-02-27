package com.greencampus.controller;

import com.greencampus.dto.SessionDTO;
import com.greencampus.model.enums.UserRole;
import com.greencampus.security.AuthContext;
import com.greencampus.security.AuthenticatedUser;
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

    private boolean isAdmin(String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        return user != null && user.role() == UserRole.ADMIN;
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isAdmin(auth)) {
            AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
            return user == null
                    ? ResponseEntity.status(401).body(Map.of("error", "Not authenticated"))
                    : ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getByRoom(
            @PathVariable Long roomId,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isAdmin(auth)) {
            AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
            return user == null
                    ? ResponseEntity.status(401).body(Map.of("error", "Not authenticated"))
                    : ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(sessionService.getSessionsByRoom(roomId));
    }

    @PostMapping("/import")
    public ResponseEntity<?> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isAdmin(auth)) {
            AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
            return user == null
                    ? ResponseEntity.status(401).body(Map.of("error", "Not authenticated"))
                    : ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        try {
            int count = sessionService.importCsv(file.getInputStream());
            return ResponseEntity.ok(Map.of("imported", count, "status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<?> clearRoom(
            @PathVariable Long roomId,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isAdmin(auth)) {
            AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
            return user == null
                    ? ResponseEntity.status(401).body(Map.of("error", "Not authenticated"))
                    : ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        sessionService.clearRoomSessions(roomId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/occupancy")
    public ResponseEntity<?> occupancy(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isAdmin(auth)) {
            AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
            return user == null
                    ? ResponseEntity.status(401).body(Map.of("error", "Not authenticated"))
                    : ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(Map.of("occupiedRooms", sessionService.countOccupiedNow()));
    }
}

package com.greencampus.controller;

import com.greencampus.dto.*;
import com.greencampus.model.enums.UserRole;
import com.greencampus.model.enums.RoomStatus;
import com.greencampus.model.enums.RoomType;
import com.greencampus.security.AuthContext;
import com.greencampus.security.AuthenticatedUser;
import com.greencampus.service.AuditLogService;
import com.greencampus.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<RoomListDTO>> listRooms(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) RoomType type,
            @RequestParam(required = false) RoomStatus status,
            @RequestParam(required = false) Integer minWorkingPcs,
            @RequestParam(required = false) Boolean needsProjector,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (AuthContext.fromAuthorizationHeader(auth) == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                roomService.searchRooms(q, type, status, minWorkingPcs, needsProjector));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoom(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (AuthContext.fromAuthorizationHeader(auth) == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(roomService.getRoomDetail(id));
    }

    @PostMapping
    public ResponseEntity<?> createRoom(
            @RequestBody RoomCreateDTO dto,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        RoomDetailDTO created = roomService.createRoom(dto);
        auditLogService.logAdminAction(
                user,
                "CREATE",
                "ROOM",
                created.getId(),
                "Room " + created.getCode() + " created",
                null,
                created);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(
            @PathVariable Long id,
            @RequestBody RoomCreateDTO dto,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(roomService.updateRoom(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        // Get room info before deleting for audit log
        RoomDetailDTO room = roomService.getRoomDetail(id);
        roomService.deleteRoom(id);
        auditLogService.logAdminAction(
                user,
                "DELETE",
                "ROOM",
                id,
                "Room " + room.getCode() + " deleted",
                room,
                null);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assets/init-table-pcs")
    public ResponseEntity<?> initTablePcs(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(roomService.initTablePcs(id));
    }
}

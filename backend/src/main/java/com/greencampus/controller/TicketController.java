package com.greencampus.controller;

import com.greencampus.dto.TicketCreateDTO;
import com.greencampus.dto.TicketDTO;
import com.greencampus.model.enums.UserRole;
import com.greencampus.model.enums.TicketPriority;
import com.greencampus.model.enums.TicketStatus;
import com.greencampus.security.AuthContext;
import com.greencampus.security.AuthenticatedUser;
import com.greencampus.service.AuditLogService;
import com.greencampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<TicketDTO>> listTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long roomId,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (AuthContext.fromAuthorizationHeader(auth) == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(ticketService.searchTickets(status, priority, roomId));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(
            @RequestBody TicketCreateDTO dto,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.TECHNICIAN) {
            return ResponseEntity.status(403).body(Map.of("error", "Technician access required"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.TECHNICIAN && user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Technician or Admin access required"));
        }
        TicketStatus status = TicketStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        // Get ticket info before deleting for audit log
        List<TicketDTO> tickets = ticketService.searchTickets(null, null, null);
        TicketDTO ticketSnapshot = tickets.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElse(null);
        String ticketTitle = ticketSnapshot != null ? ticketSnapshot.getTitle() : "unknown";
        ticketService.deleteTicket(id);
        auditLogService.logAdminAction(
                user,
                "DELETE",
                "TICKET",
                id,
                "Ticket '" + ticketTitle + "' deleted",
                ticketSnapshot,
                null);
        return ResponseEntity.noContent().build();
    }
}

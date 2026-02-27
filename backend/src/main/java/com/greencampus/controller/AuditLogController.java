package com.greencampus.controller;

import com.greencampus.model.AuditLog;
import com.greencampus.model.enums.UserRole;
import com.greencampus.security.AuthContext;
import com.greencampus.security.AuthenticatedUser;
import com.greencampus.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-log")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String entityType,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(auditLogService.getFiltered(from, to, entityType));
    }
}

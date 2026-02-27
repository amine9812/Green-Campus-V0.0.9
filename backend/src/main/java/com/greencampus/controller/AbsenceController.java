package com.greencampus.controller;

import com.greencampus.dto.AbsenceDTO;
import com.greencampus.dto.FreeRoomDTO;
import com.greencampus.model.enums.DayOfWeekEnum;
import com.greencampus.model.enums.UserRole;
import com.greencampus.security.AuthContext;
import com.greencampus.security.AuthenticatedUser;
import com.greencampus.service.AbsenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/absences")
@RequiredArgsConstructor
public class AbsenceController {

    private final AbsenceService absenceService;

    private ResponseEntity<Map<String, String>> adminOnlyError(String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> listAll(@RequestHeader(value = "Authorization", required = false) String auth) {
        ResponseEntity<Map<String, String>> error = adminOnlyError(auth);
        if (error != null)
            return error;
        return ResponseEntity.ok(absenceService.listAll());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<?> listByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        ResponseEntity<Map<String, String>> error = adminOnlyError(auth);
        if (error != null)
            return error;
        return ResponseEntity.ok(absenceService.listByDate(date));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        ResponseEntity<Map<String, String>> error = adminOnlyError(auth);
        if (error != null)
            return error;
        Long sessionId = ((Number) body.get("sessionId")).longValue();
        LocalDate date = LocalDate.parse((String) body.get("absenceDate"));
        String reason = (String) body.getOrDefault("reason", "");
        return ResponseEntity.ok(absenceService.createAbsence(sessionId, date, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        ResponseEntity<Map<String, String>> error = adminOnlyError(auth);
        if (error != null)
            return error;
        absenceService.deleteAbsence(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/free-rooms")
    public ResponseEntity<?> suggestFreeRooms(
            @RequestParam DayOfWeekEnum day,
            @RequestParam String start,
            @RequestParam String end,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        ResponseEntity<Map<String, String>> error = adminOnlyError(auth);
        if (error != null)
            return error;
        return ResponseEntity.ok(absenceService.suggestFreeRooms(day, LocalTime.parse(start), LocalTime.parse(end)));
    }
}

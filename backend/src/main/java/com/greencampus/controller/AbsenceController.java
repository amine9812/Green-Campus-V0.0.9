package com.greencampus.controller;

import com.greencampus.dto.AbsenceDTO;
import com.greencampus.dto.FreeRoomDTO;
import com.greencampus.model.enums.DayOfWeekEnum;
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

    @GetMapping
    public List<AbsenceDTO> listAll() {
        return absenceService.listAll();
    }

    @GetMapping("/date/{date}")
    public List<AbsenceDTO> listByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return absenceService.listByDate(date);
    }

    @PostMapping
    public AbsenceDTO create(@RequestBody Map<String, Object> body) {
        Long sessionId = ((Number) body.get("sessionId")).longValue();
        LocalDate date = LocalDate.parse((String) body.get("absenceDate"));
        String reason = (String) body.getOrDefault("reason", "");
        return absenceService.createAbsence(sessionId, date, reason);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        absenceService.deleteAbsence(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/free-rooms")
    public List<FreeRoomDTO> suggestFreeRooms(
            @RequestParam DayOfWeekEnum day,
            @RequestParam String start,
            @RequestParam String end) {
        return absenceService.suggestFreeRooms(day, LocalTime.parse(start), LocalTime.parse(end));
    }
}

package com.greencampus.service;

import com.greencampus.dto.SessionDTO;
import com.greencampus.model.Room;
import com.greencampus.model.Session;
import com.greencampus.model.enums.DayOfWeekEnum;
import com.greencampus.repository.RoomRepository;
import com.greencampus.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final RoomRepository roomRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("H:mm");

    // ─── List by room ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<SessionDTO> getSessionsByRoom(Long roomId) {
        return sessionRepository.findByRoomIdOrderByDayOfWeekAscStartTimeAsc(roomId)
                .stream().map(this::toDTO).toList();
    }

    // ─── List all ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<SessionDTO> getAllSessions() {
        return sessionRepository.findAll().stream().map(this::toDTO).toList();
    }

    // ─── CSV Import ────────────────────────────────────────────
    @Transactional
    public int importCsv(InputStream csv) {
        List<Session> sessions = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csv))) {
            String line;
            boolean header = true;
            while ((line = reader.readLine()) != null) {
                if (header) {
                    header = false;
                    continue;
                }
                String[] cols = line.split(",", -1);
                if (cols.length < 6)
                    continue;

                String roomCode = cols[0].trim();
                String courseName = cols[1].trim();
                String teacherName = cols[2].trim();
                DayOfWeekEnum day = DayOfWeekEnum.valueOf(cols[3].trim().toUpperCase());
                String[] times = cols[4].trim().split("-");
                LocalTime start = LocalTime.parse(times[0].trim(), TIME_FMT);
                LocalTime end = LocalTime.parse(times[1].trim(), TIME_FMT);
                String groupName = cols[5].trim();

                Room room = roomRepository.findByCode(roomCode)
                        .orElseThrow(() -> new RuntimeException("Room not found: " + roomCode));

                sessions.add(Session.builder()
                        .room(room).courseName(courseName).teacherName(teacherName)
                        .dayOfWeek(day).startTime(start).endTime(end).groupName(groupName)
                        .build());
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV parse error: " + e.getMessage(), e);
        }
        sessionRepository.saveAll(sessions);
        return sessions.size();
    }

    // ─── Delete all sessions for a room ────────────────────────
    @Transactional
    public void clearRoomSessions(Long roomId) {
        sessionRepository.deleteByRoomId(roomId);
    }

    // ─── Occupancy ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public long countOccupiedNow() {
        java.time.DayOfWeek javaDow = java.time.LocalDate.now().getDayOfWeek();
        DayOfWeekEnum dow = DayOfWeekEnum.valueOf(javaDow.name());
        LocalTime now = LocalTime.now();
        return sessionRepository.countOccupiedRoomsAt(dow, now);
    }

    // ─── Mapper ────────────────────────────────────────────────
    private SessionDTO toDTO(Session s) {
        return SessionDTO.builder()
                .id(s.getId())
                .roomId(s.getRoom().getId())
                .roomCode(s.getRoom().getCode())
                .courseName(s.getCourseName())
                .teacherName(s.getTeacherName())
                .dayOfWeek(s.getDayOfWeek())
                .startTime(s.getStartTime().format(TIME_FMT))
                .endTime(s.getEndTime().format(TIME_FMT))
                .groupName(s.getGroupName())
                .build();
    }
}

package com.greencampus.service;

import com.greencampus.dto.AbsenceDTO;
import com.greencampus.dto.FreeRoomDTO;
import com.greencampus.model.Absence;
import com.greencampus.model.Room;
import com.greencampus.model.Session;
import com.greencampus.model.enums.DayOfWeekEnum;
import com.greencampus.model.enums.RoomStatus;
import com.greencampus.repository.AbsenceRepository;
import com.greencampus.repository.RoomRepository;
import com.greencampus.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final SessionRepository sessionRepository;
    private final RoomRepository roomRepository;

    private static final DateTimeFormatter TF = DateTimeFormatter.ofPattern("H:mm");

    // ─── Create absence ────────────────────────────────────────
    @Transactional
    public AbsenceDTO createAbsence(Long sessionId, LocalDate date, String reason) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Absence a = Absence.builder()
                .teacherName(session.getTeacherName())
                .absenceDate(date)
                .dayOfWeek(session.getDayOfWeek())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .reason(reason)
                .session(session)
                .build();
        return toDTO(absenceRepository.save(a));
    }

    // ─── List absences ─────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AbsenceDTO> listAll() {
        return absenceRepository.findAllByOrderByAbsenceDateDescStartTimeAsc()
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AbsenceDTO> listByDate(LocalDate date) {
        return absenceRepository.findByAbsenceDateOrderByStartTimeAsc(date)
                .stream().map(this::toDTO).toList();
    }

    // ─── Suggest free rooms ────────────────────────────────────
    @Transactional(readOnly = true)
    public List<FreeRoomDTO> suggestFreeRooms(DayOfWeekEnum day, LocalTime start, LocalTime end) {
        List<Room> allRooms = roomRepository.findAll().stream()
                .filter(r -> r.getStatus() == RoomStatus.OPEN)
                .toList();

        return allRooms.stream()
                .filter(r -> {
                    List<Session> conflicts = sessionRepository.findConflicts(r.getId(), day, start, end);
                    return conflicts.isEmpty();
                })
                .map(r -> FreeRoomDTO.builder()
                        .roomId(r.getId())
                        .roomCode(r.getCode())
                        .roomType(r.getType().name())
                        .capacity(r.getCapacity())
                        .reason("No schedule conflict")
                        .build())
                .toList();
    }

    // ─── Delete absence ────────────────────────────────────────
    @Transactional
    public void deleteAbsence(Long id) {
        absenceRepository.deleteById(id);
    }

    // ─── Mapper ────────────────────────────────────────────────
    private AbsenceDTO toDTO(Absence a) {
        AbsenceDTO dto = AbsenceDTO.builder()
                .id(a.getId())
                .teacherName(a.getTeacherName())
                .absenceDate(a.getAbsenceDate())
                .dayOfWeek(a.getDayOfWeek())
                .startTime(a.getStartTime().format(TF))
                .endTime(a.getEndTime().format(TF))
                .reason(a.getReason())
                .build();
        if (a.getSession() != null) {
            dto.setSessionId(a.getSession().getId());
            dto.setCourseName(a.getSession().getCourseName());
            dto.setRoomCode(a.getSession().getRoom().getCode());
        }
        return dto;
    }
}

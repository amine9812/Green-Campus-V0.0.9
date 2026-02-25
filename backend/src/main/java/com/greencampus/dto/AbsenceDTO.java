package com.greencampus.dto;

import com.greencampus.model.enums.DayOfWeekEnum;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceDTO {
    private Long id;
    private String teacherName;
    private LocalDate absenceDate;
    private DayOfWeekEnum dayOfWeek;
    private String startTime;
    private String endTime;
    private String reason;
    private Long sessionId;
    private String courseName;
    private String roomCode;
}

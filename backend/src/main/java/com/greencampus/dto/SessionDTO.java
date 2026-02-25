package com.greencampus.dto;

import com.greencampus.model.enums.DayOfWeekEnum;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionDTO {
    private Long id;
    private Long roomId;
    private String roomCode;
    private String courseName;
    private String teacherName;
    private DayOfWeekEnum dayOfWeek;
    private String startTime;
    private String endTime;
    private String groupName;
}

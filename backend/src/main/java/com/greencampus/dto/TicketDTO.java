package com.greencampus.dto;

import com.greencampus.model.enums.TicketPriority;
import com.greencampus.model.enums.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDTO {
    private Long id;
    private Long roomId;
    private String roomCode;
    private String title;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

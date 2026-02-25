package com.greencampus.dto;

import com.greencampus.model.enums.TicketPriority;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCreateDTO {
    private Long roomId;
    private String title;
    private String description;
    private TicketPriority priority;
}

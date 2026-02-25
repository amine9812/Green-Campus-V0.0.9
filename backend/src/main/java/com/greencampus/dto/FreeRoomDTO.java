package com.greencampus.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreeRoomDTO {
    private Long roomId;
    private String roomCode;
    private String roomType;
    private int capacity;
    private String reason;
}

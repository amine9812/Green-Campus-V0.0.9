package com.greencampus.dto;

import com.greencampus.model.enums.AssetStatus;
import com.greencampus.model.enums.RoomStatus;
import com.greencampus.model.enums.RoomType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomListDTO {
    private Long id;
    private String code;
    private RoomType type;
    private int capacity;
    private RoomStatus status;
    private int totalTables;
    private boolean tablesHavePcs;
    private String notes;

    // Computed fields
    private int totalPcs;
    private int workingPcs;
    private int brokenPcs;
    private boolean hasProjector;
    private AssetStatus projectorStatus;
    private AssetStatus teacherPcStatus;
    private double healthScore;
    private String occupancyStatus; // IDLE / OCCUPIED / CLOSED
}

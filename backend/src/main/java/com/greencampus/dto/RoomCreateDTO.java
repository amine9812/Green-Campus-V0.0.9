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
public class RoomCreateDTO {
    private String code;
    private RoomType type;
    private int capacity;
    private RoomStatus status;
    private int totalTables;
    private boolean tablesHavePcs;
    private String notes;
    private AssetStatus projectorStatus; // default WORKING
    private AssetStatus teacherPcStatus; // default WORKING
}

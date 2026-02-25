package com.greencampus.dto;

import com.greencampus.model.enums.AssetStatus;
import com.greencampus.model.enums.RoomStatus;
import com.greencampus.model.enums.RoomType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDetailDTO {
    private Long id;
    private String code;
    private RoomType type;
    private int capacity;
    private RoomStatus status;
    private int totalTables;
    private boolean tablesHavePcs;
    private String notes;

    // Computed
    private int totalPcs;
    private int workingPcs;
    private int brokenPcs;
    private boolean hasProjector;
    private AssetStatus projectorStatus;
    private AssetStatus teacherPcStatus;
    private double healthScore;
    private String occupancyStatus;

    // Assets list
    private List<AssetDTO> assets;
}

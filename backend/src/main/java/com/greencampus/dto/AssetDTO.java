package com.greencampus.dto;

import com.greencampus.model.enums.AssetStatus;
import com.greencampus.model.enums.AssetType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDTO {
    private Long id;
    private AssetType type;
    private String label;
    private AssetStatus status;
    private Integer tableIndex;
}

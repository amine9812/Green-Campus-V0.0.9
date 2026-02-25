package com.greencampus.dto;

import com.greencampus.model.enums.AssetStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetStatusUpdateDTO {
    private AssetStatus status;
}

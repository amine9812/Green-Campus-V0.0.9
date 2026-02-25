package com.greencampus.controller;

import com.greencampus.dto.AssetDTO;
import com.greencampus.dto.AssetStatusUpdateDTO;
import com.greencampus.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final RoomService roomService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<AssetDTO> updateAssetStatus(
            @PathVariable Long id,
            @RequestBody AssetStatusUpdateDTO dto) {
        return ResponseEntity.ok(roomService.updateAssetStatus(id, dto.getStatus()));
    }
}

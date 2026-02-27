package com.greencampus.controller;

import com.greencampus.dto.AssetDTO;
import com.greencampus.dto.AssetStatusUpdateDTO;
import com.greencampus.model.enums.UserRole;
import com.greencampus.security.AuthContext;
import com.greencampus.security.AuthenticatedUser;
import com.greencampus.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final RoomService roomService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateAssetStatus(
            @PathVariable Long id,
            @RequestBody AssetStatusUpdateDTO dto,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        AuthenticatedUser user = AuthContext.fromAuthorizationHeader(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        if (user.role() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(roomService.updateAssetStatus(id, dto.getStatus()));
    }
}

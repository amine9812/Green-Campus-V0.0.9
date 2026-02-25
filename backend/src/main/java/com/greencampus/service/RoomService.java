package com.greencampus.service;

import com.greencampus.dto.*;
import com.greencampus.model.Asset;
import com.greencampus.model.Room;
import com.greencampus.model.enums.*;
import com.greencampus.repository.AssetRepository;
import com.greencampus.repository.RoomRepository;
import com.greencampus.repository.TicketRepository;
import com.greencampus.model.enums.TicketPriority;
import com.greencampus.model.enums.TicketStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

        private final RoomRepository roomRepository;
        private final AssetRepository assetRepository;
        private final TicketRepository ticketRepository;

        // ─── Search / List ────────────────────────────────────────────
        @Transactional(readOnly = true)
        public List<RoomListDTO> searchRooms(String q, RoomType type, RoomStatus status,
                        Integer minWorkingPcs, Boolean needsProjector) {
                List<Room> rooms = roomRepository.searchRooms(
                                q != null && q.isBlank() ? null : q,
                                type,
                                status);

                return rooms.stream()
                                .map(this::toListDTO)
                                .filter(dto -> minWorkingPcs == null || dto.getWorkingPcs() >= minWorkingPcs)
                                .filter(dto -> needsProjector == null || !needsProjector || dto.isHasProjector())
                                .toList();
        }

        // ─── Get Detail ───────────────────────────────────────────────
        @Transactional(readOnly = true)
        public RoomDetailDTO getRoomDetail(Long id) {
                Room room = findRoom(id);
                return toDetailDTO(room);
        }

        // ─── Create ───────────────────────────────────────────────────
        @Transactional
        public RoomDetailDTO createRoom(RoomCreateDTO dto) {
                Room room = Room.builder()
                                .code(dto.getCode())
                                .type(dto.getType())
                                .capacity(dto.getCapacity())
                                .status(dto.getStatus() != null ? dto.getStatus() : RoomStatus.OPEN)
                                .totalTables(dto.getTotalTables())
                                .tablesHavePcs(dto.isTablesHavePcs())
                                .notes(dto.getNotes())
                                .assets(new ArrayList<>())
                                .build();

                // Default assets
                Asset projector = Asset.builder()
                                .room(room).type(AssetType.PROJECTOR).label("Projector")
                                .status(dto.getProjectorStatus() != null ? dto.getProjectorStatus()
                                                : AssetStatus.WORKING)
                                .build();
                Asset teacherPc = Asset.builder()
                                .room(room).type(AssetType.TEACHER_PC).label("Teacher PC")
                                .status(dto.getTeacherPcStatus() != null ? dto.getTeacherPcStatus()
                                                : AssetStatus.WORKING)
                                .build();
                room.getAssets().add(projector);
                room.getAssets().add(teacherPc);

                // Table PCs
                if (dto.isTablesHavePcs() && dto.getTotalTables() > 0) {
                        for (int i = 1; i <= dto.getTotalTables(); i++) {
                                room.getAssets().add(Asset.builder()
                                                .room(room).type(AssetType.TABLE_PC)
                                                .label("PC-" + String.format("%02d", i))
                                                .status(AssetStatus.WORKING)
                                                .tableIndex(i)
                                                .build());
                        }
                }

                Room saved = roomRepository.save(room);
                return toDetailDTO(saved);
        }

        // ─── Update ───────────────────────────────────────────────────
        @Transactional
        public RoomDetailDTO updateRoom(Long id, RoomCreateDTO dto) {
                Room room = findRoom(id);

                room.setCode(dto.getCode());
                room.setType(dto.getType());
                room.setCapacity(dto.getCapacity());
                if (dto.getStatus() != null)
                        room.setStatus(dto.getStatus());
                room.setNotes(dto.getNotes());

                // Handle table count change
                int oldTables = room.getTotalTables();
                boolean oldHavePcs = room.isTablesHavePcs();
                room.setTotalTables(dto.getTotalTables());
                room.setTablesHavePcs(dto.isTablesHavePcs());

                if (dto.isTablesHavePcs() != oldHavePcs || dto.getTotalTables() != oldTables) {
                        reconcileTablePcs(room, dto.getTotalTables(), dto.isTablesHavePcs());
                }

                // Update projector/teacher PC statuses if provided
                if (dto.getProjectorStatus() != null) {
                        room.getAssets().stream()
                                        .filter(a -> a.getType() == AssetType.PROJECTOR).findFirst()
                                        .ifPresent(a -> a.setStatus(dto.getProjectorStatus()));
                }
                if (dto.getTeacherPcStatus() != null) {
                        room.getAssets().stream()
                                        .filter(a -> a.getType() == AssetType.TEACHER_PC).findFirst()
                                        .ifPresent(a -> a.setStatus(dto.getTeacherPcStatus()));
                }

                Room saved = roomRepository.save(room);
                return toDetailDTO(saved);
        }

        // ─── Delete ───────────────────────────────────────────────────
        @Transactional
        public void deleteRoom(Long id) {
                Room room = findRoom(id);
                roomRepository.delete(room);
        }

        // ─── Asset Status Update ──────────────────────────────────────
        @Transactional
        public AssetDTO updateAssetStatus(Long assetId, AssetStatus status) {
                Asset asset = assetRepository.findById(assetId)
                                .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));
                asset.setStatus(status);
                Asset saved = assetRepository.save(asset);
                return toAssetDTO(saved);
        }

        // ─── Init Table PCs ───────────────────────────────────────────
        @Transactional
        public RoomDetailDTO initTablePcs(Long roomId) {
                Room room = findRoom(roomId);
                reconcileTablePcs(room, room.getTotalTables(), room.isTablesHavePcs());
                Room saved = roomRepository.save(room);
                return toDetailDTO(saved);
        }

        // ═══════════ Private helpers ═══════════════════════════════════

        private Room findRoom(Long id) {
                return roomRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Room not found: " + id));
        }

        private void reconcileTablePcs(Room room, int targetCount, boolean havePcs) {
                // Remove existing TABLE_PC assets
                room.getAssets().removeIf(a -> a.getType() == AssetType.TABLE_PC);

                if (havePcs && targetCount > 0) {
                        for (int i = 1; i <= targetCount; i++) {
                                room.getAssets().add(Asset.builder()
                                                .room(room).type(AssetType.TABLE_PC)
                                                .label("PC-" + String.format("%02d", i))
                                                .status(AssetStatus.WORKING)
                                                .tableIndex(i)
                                                .build());
                        }
                }
        }

        // ─── DTO Mappers ──────────────────────────────────────────────

        private RoomListDTO toListDTO(Room room) {
                List<Asset> assets = room.getAssets();
                List<Asset> tablePcs = assets.stream()
                                .filter(a -> a.getType() == AssetType.TABLE_PC).toList();

                int totalPcs = tablePcs.size();
                int workingPcs = (int) tablePcs.stream()
                                .filter(a -> a.getStatus() == AssetStatus.WORKING).count();

                Asset projector = assets.stream()
                                .filter(a -> a.getType() == AssetType.PROJECTOR).findFirst().orElse(null);
                Asset teacherPc = assets.stream()
                                .filter(a -> a.getType() == AssetType.TEACHER_PC).findFirst().orElse(null);

                AssetStatus projStatus = projector != null ? projector.getStatus() : null;
                AssetStatus tpcStatus = teacherPc != null ? teacherPc.getStatus() : null;

                return RoomListDTO.builder()
                                .id(room.getId()).code(room.getCode()).type(room.getType())
                                .capacity(room.getCapacity()).status(room.getStatus())
                                .totalTables(room.getTotalTables()).tablesHavePcs(room.isTablesHavePcs())
                                .notes(room.getNotes())
                                .totalPcs(totalPcs).workingPcs(workingPcs).brokenPcs(totalPcs - workingPcs)
                                .hasProjector(projector != null).projectorStatus(projStatus)
                                .teacherPcStatus(tpcStatus)
                                .healthScore(computeHealthScore(room.getId(), totalPcs, workingPcs, projStatus))
                                .occupancyStatus(room.getStatus() == RoomStatus.CLOSED ? "CLOSED" : "IDLE")
                                .build();
        }

        private RoomDetailDTO toDetailDTO(Room room) {
                RoomListDTO base = toListDTO(room);
                List<AssetDTO> assetDtos = room.getAssets().stream()
                                .map(this::toAssetDTO).toList();

                return RoomDetailDTO.builder()
                                .id(base.getId()).code(base.getCode()).type(base.getType())
                                .capacity(base.getCapacity()).status(base.getStatus())
                                .totalTables(base.getTotalTables()).tablesHavePcs(base.isTablesHavePcs())
                                .notes(base.getNotes())
                                .totalPcs(base.getTotalPcs()).workingPcs(base.getWorkingPcs())
                                .brokenPcs(base.getBrokenPcs())
                                .hasProjector(base.isHasProjector()).projectorStatus(base.getProjectorStatus())
                                .teacherPcStatus(base.getTeacherPcStatus())
                                .healthScore(base.getHealthScore()).occupancyStatus(base.getOccupancyStatus())
                                .assets(assetDtos)
                                .build();
        }

        private AssetDTO toAssetDTO(Asset a) {
                return AssetDTO.builder()
                                .id(a.getId()).type(a.getType()).label(a.getLabel())
                                .status(a.getStatus()).tableIndex(a.getTableIndex())
                                .build();
        }

        private double computeHealthScore(Long roomId, int totalPcs, int workingPcs, AssetStatus projectorStatus) {
                long openP1 = ticketRepository.countByRoomIdAndPriorityAndStatusNot(
                                roomId, TicketPriority.P1, TicketStatus.RESOLVED);
                double score;
                if (totalPcs == 0) {
                        double projScore = (projectorStatus == AssetStatus.WORKING) ? 50.0 : 0.0;
                        double ticketScore = openP1 > 0 ? 0.0 : 50.0;
                        score = projScore + ticketScore;
                } else {
                        double pcScore = 60.0 * workingPcs / totalPcs;
                        double projScore = (projectorStatus == AssetStatus.WORKING) ? 20.0 : 0.0;
                        double ticketScore = openP1 > 0 ? 0.0 : 20.0;
                        score = pcScore + projScore + ticketScore;
                }
                return Math.round(score * 10.0) / 10.0;
        }
}

package com.greencampus.repository;

import com.greencampus.model.Asset;
import com.greencampus.model.enums.AssetStatus;
import com.greencampus.model.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByRoomId(Long roomId);

    List<Asset> findByRoomIdAndType(Long roomId, AssetType type);

    void deleteByRoomIdAndType(Long roomId, AssetType type);

    long countByTypeAndStatus(AssetType type, AssetStatus status);
}

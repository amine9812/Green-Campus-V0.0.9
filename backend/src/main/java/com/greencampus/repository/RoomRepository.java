package com.greencampus.repository;

import com.greencampus.model.Room;
import com.greencampus.model.enums.RoomStatus;
import com.greencampus.model.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

  Optional<Room> findByCode(String code);

  @Query("""
          SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.assets
          WHERE (:q IS NULL OR LOWER(r.code) LIKE LOWER(CONCAT('%', :q, '%')))
            AND (:type IS NULL OR r.type = :type)
            AND (:status IS NULL OR r.status = :status)
          ORDER BY r.code
      """)
  List<Room> searchRooms(
      @Param("q") String q,
      @Param("type") RoomType type,
      @Param("status") RoomStatus status);
}

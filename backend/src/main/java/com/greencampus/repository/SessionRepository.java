package com.greencampus.repository;

import com.greencampus.model.Session;
import com.greencampus.model.enums.DayOfWeekEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByRoomIdOrderByDayOfWeekAscStartTimeAsc(Long roomId);

    @Query("""
                SELECT s FROM Session s
                WHERE s.dayOfWeek = :day
                  AND s.startTime < :endTime
                  AND s.endTime > :startTime
                  AND s.room.id = :roomId
            """)
    List<Session> findConflicts(
            @Param("roomId") Long roomId,
            @Param("day") DayOfWeekEnum day,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT COUNT(DISTINCT s.room.id) FROM Session s WHERE s.dayOfWeek = :day AND s.startTime <= :time AND s.endTime > :time")
    long countOccupiedRoomsAt(@Param("day") DayOfWeekEnum day, @Param("time") LocalTime time);

    void deleteByRoomId(Long roomId);
}

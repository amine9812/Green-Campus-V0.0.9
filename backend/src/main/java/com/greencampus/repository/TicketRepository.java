package com.greencampus.repository;

import com.greencampus.model.Ticket;
import com.greencampus.model.enums.TicketPriority;
import com.greencampus.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

  List<Ticket> findByRoomIdOrderByCreatedAtDesc(Long roomId);

  @Query("""
          SELECT t FROM Ticket t JOIN FETCH t.room
          WHERE (:status IS NULL OR t.status = :status)
            AND (:priority IS NULL OR t.priority = :priority)
            AND (:roomId IS NULL OR t.room.id = :roomId)
          ORDER BY t.createdAt DESC
      """)
  List<Ticket> searchTickets(
      @Param("status") TicketStatus status,
      @Param("priority") TicketPriority priority,
      @Param("roomId") Long roomId);

  // Count open P1 tickets for a room (used in health score)
  long countByRoomIdAndPriorityAndStatusNot(Long roomId, TicketPriority priority, TicketStatus status);

  // Stats: count open tickets
  long countByStatusNot(TicketStatus status);
}

package com.greencampus.service;

import com.greencampus.dto.TicketCreateDTO;
import com.greencampus.dto.TicketDTO;
import com.greencampus.model.Room;
import com.greencampus.model.Ticket;
import com.greencampus.model.enums.TicketPriority;
import com.greencampus.model.enums.TicketStatus;
import com.greencampus.repository.RoomRepository;
import com.greencampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public List<TicketDTO> searchTickets(TicketStatus status, TicketPriority priority, Long roomId) {
        return ticketRepository.searchTickets(status, priority, roomId).stream()
                .map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDTO> getTicketsForRoom(Long roomId) {
        return ticketRepository.findByRoomIdOrderByCreatedAtDesc(roomId).stream()
                .map(this::toDTO).toList();
    }

    @Transactional
    public TicketDTO createTicket(TicketCreateDTO dto) {
        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found: " + dto.getRoomId()));

        Ticket ticket = Ticket.builder()
                .room(room)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : TicketPriority.P3)
                .status(TicketStatus.OPEN)
                .build();

        return toDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketDTO updateTicketStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
        ticket.setStatus(status);
        return toDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    /** Count unresolved P1 tickets for a room (used in health score). */
    public long countOpenP1Tickets(Long roomId) {
        return ticketRepository.countByRoomIdAndPriorityAndStatusNot(
                roomId, TicketPriority.P1, TicketStatus.RESOLVED);
    }

    private TicketDTO toDTO(Ticket t) {
        return TicketDTO.builder()
                .id(t.getId())
                .roomId(t.getRoom().getId())
                .roomCode(t.getRoom().getCode())
                .title(t.getTitle())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}

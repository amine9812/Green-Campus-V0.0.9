package com.greencampus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greencampus.model.AuditLog;
import com.greencampus.repository.UserRepository;
import com.greencampus.security.AuthenticatedUser;
import com.greencampus.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public void logAdminAction(AuthenticatedUser actor, String actionType, String entityType, Long entityId,
            String summary, Object beforeObject, Object afterObject) {
        Long actorUserId = userRepository.findByUsername(actor.username())
                .map(u -> u.getId())
                .orElse(null);

        auditLogRepository.save(new AuditLog(
                actionType,
                entityType,
                entityId,
                summary,
                actorUserId,
                actor.username(),
                actor.role().name(),
                toJson(beforeObject),
                toJson(afterObject)));
    }

    public List<AuditLog> getAll() {
        return auditLogRepository.findAllByOrderByEventTimestampDesc();
    }

    public List<AuditLog> getFiltered(LocalDateTime from, LocalDateTime to, String entityType) {
        return auditLogRepository.findAllByOrderByEventTimestampDesc().stream()
                .filter(log -> from == null || !log.getEventTimestamp().isBefore(from))
                .filter(log -> to == null || !log.getEventTimestamp().isAfter(to))
                .filter(log -> entityType == null || entityType.isBlank()
                        || entityType.equalsIgnoreCase(log.getEntityType()))
                .toList();
    }

    private String toJson(Object value) {
        if (value == null)
            return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{\"serializationError\":true}";
        }
    }
}

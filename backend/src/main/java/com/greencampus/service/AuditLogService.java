package com.greencampus.service;

import com.greencampus.model.AuditLog;
import com.greencampus.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, Long entityId, String details, String performedBy) {
        auditLogRepository.save(new AuditLog(action, entityType, entityId, details, performedBy));
    }

    public List<AuditLog> getAll() {
        return auditLogRepository.findAllByOrderByPerformedAtDesc();
    }
}

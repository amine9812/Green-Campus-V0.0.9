package com.greencampus.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Data
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_timestamp", nullable = false)
    private LocalDateTime eventTimestamp;

    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Column(name = "actor_username", nullable = false, length = 100)
    private String actorUsername;

    @Column(name = "actor_role", nullable = false, length = 50)
    private String actorRole;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType; // DELETE, CREATE, UPDATE

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // ROOM, TICKET, ASSET...

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "summary", length = 500)
    private String summary;

    @Lob
    @Column(name = "before_json")
    private String beforeJson;

    @Lob
    @Column(name = "after_json")
    private String afterJson;

    public AuditLog(String actionType, String entityType, Long entityId, String summary,
            Long actorUserId, String actorUsername, String actorRole, String beforeJson, String afterJson) {
        this.actionType = actionType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.summary = summary;
        this.actorUserId = actorUserId;
        this.actorUsername = actorUsername;
        this.actorRole = actorRole;
        this.beforeJson = beforeJson;
        this.afterJson = afterJson;
        this.eventTimestamp = LocalDateTime.now();
    }
}

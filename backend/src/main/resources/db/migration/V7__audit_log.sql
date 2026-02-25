CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL PRIMARY KEY,
    action      VARCHAR(50)  NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   BIGINT,
    details     VARCHAR(500),
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

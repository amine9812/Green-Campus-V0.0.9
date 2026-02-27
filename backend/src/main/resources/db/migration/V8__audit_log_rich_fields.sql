ALTER TABLE audit_log RENAME COLUMN action TO action_type;
ALTER TABLE audit_log RENAME COLUMN details TO summary;
ALTER TABLE audit_log RENAME COLUMN performed_by TO actor_username;
ALTER TABLE audit_log RENAME COLUMN performed_at TO event_timestamp;

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS actor_user_id BIGINT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS actor_role VARCHAR(50);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS before_json TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS after_json TEXT;

UPDATE audit_log
SET actor_role = COALESCE(actor_role, 'ADMIN')
WHERE actor_role IS NULL;

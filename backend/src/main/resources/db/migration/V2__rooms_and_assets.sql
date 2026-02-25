-- V2__rooms_and_assets.sql

CREATE TABLE rooms (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    type            VARCHAR(20) NOT NULL,       -- CLASS, LAB, AMPHI
    capacity        INT NOT NULL DEFAULT 30,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN',  -- OPEN, CLOSED
    total_tables    INT NOT NULL DEFAULT 0,
    tables_have_pcs BOOLEAN NOT NULL DEFAULT FALSE,
    notes           TEXT
);

CREATE TABLE assets (
    id          BIGSERIAL PRIMARY KEY,
    room_id     BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL,    -- PROJECTOR, TEACHER_PC, TABLE_PC
    label       VARCHAR(100) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'WORKING',  -- WORKING, BROKEN
    table_index INT                       -- only for TABLE_PC
);

CREATE INDEX idx_assets_room_id ON assets(room_id);
CREATE INDEX idx_rooms_code ON rooms(code);

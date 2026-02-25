-- V4: Sessions (schedule)
CREATE TABLE sessions (
    id         BIGSERIAL    PRIMARY KEY,
    room_id    BIGINT       NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    day_of_week VARCHAR(20)  NOT NULL,
    start_time  TIME         NOT NULL,
    end_time    TIME         NOT NULL,
    group_name  VARCHAR(100) NOT NULL
);

CREATE INDEX idx_sessions_room ON sessions(room_id);
CREATE INDEX idx_sessions_day  ON sessions(day_of_week);

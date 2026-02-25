-- V5: Absences
CREATE TABLE absences (
    id            BIGSERIAL    PRIMARY KEY,
    teacher_name  VARCHAR(255) NOT NULL,
    absence_date  DATE         NOT NULL,
    day_of_week   VARCHAR(20)  NOT NULL,
    start_time    TIME         NOT NULL,
    end_time      TIME         NOT NULL,
    reason        VARCHAR(500),
    session_id    BIGINT       REFERENCES sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_absences_date ON absences(absence_date);
CREATE INDEX idx_absences_teacher ON absences(teacher_name);

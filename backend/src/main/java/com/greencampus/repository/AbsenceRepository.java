package com.greencampus.repository;

import com.greencampus.model.Absence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    List<Absence> findByAbsenceDateOrderByStartTimeAsc(LocalDate date);

    List<Absence> findByTeacherNameIgnoreCaseOrderByAbsenceDateDesc(String teacher);

    List<Absence> findAllByOrderByAbsenceDateDescStartTimeAsc();
}

package com.expensetracker.recurring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringRepository extends JpaRepository<RecurringTemplate, Long> {

    List<RecurringTemplate> findByActiveTrueAndNextRunDateLessThanEqual(LocalDate date);

    List<RecurringTemplate> findByUserId(Long userId);

    Optional<RecurringTemplate> findByIdAndUserId(Long id, Long userId);
}

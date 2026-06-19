package com.expensetracker.category;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("""
        SELECT c FROM Category c
        WHERE c.isSystem = true
           OR c.user.id = :userId
        ORDER BY c.isSystem DESC, c.name ASC
        """)
    List<Category> findAllForUser(@Param("userId") Long userId);
}
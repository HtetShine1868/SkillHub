package com.example.backend.career;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareerRepository extends JpaRepository<Career, Long> {

    Optional<Career> findByNameIgnoreCase(String name);

    List<Career> findByCategoryIgnoreCase(String category);

    List<Career> findByNameContainingIgnoreCase(String name);
}


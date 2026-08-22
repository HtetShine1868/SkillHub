package com.example.backend.career;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerDiscoveryQuestionRepository
        extends JpaRepository<CareerDiscoveryQuestion, Long> {

    List<CareerDiscoveryQuestion> findAllByOrderByOrderIndexAsc();
}

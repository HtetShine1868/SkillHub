package com.example.backend.skillexchange.repository;

import com.example.backend.skillexchange.entity.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByProjectIdAndStatus(Long projectId, String status);
    List<JoinRequest> findByApplicantEmail(String email);
    List<JoinRequest> findByApplicantEmailAndStatus(String email, String status);
    long countByProjectIdAndStatus(Long projectId, String status);
}

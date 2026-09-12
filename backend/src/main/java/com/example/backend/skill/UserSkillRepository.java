package com.example.backend.skill;

import com.example.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUser(User user);

    List<UserSkill> findByUserId(Long userId);

    Optional<UserSkill> findByUserIdAndSkillId(Long userId, Long skillId);

    @Modifying
    @Query(value = """
            INSERT INTO user_skills (confidence, current_level, skill_id, source, updated_at, user_id)
            VALUES (:confidence, :level, :skillId, :source, NOW(), :userId)
            ON CONFLICT (user_id, skill_id) DO UPDATE
            SET current_level = EXCLUDED.current_level,
                confidence = EXCLUDED.confidence,
                source = EXCLUDED.source,
                updated_at = EXCLUDED.updated_at
            """, nativeQuery = true)
    void upsertUserSkill(
            @Param("userId") Long userId,
            @Param("skillId") Long skillId,
            @Param("level") Integer level,
            @Param("confidence") Double confidence,
            @Param("source") String source
    );
}

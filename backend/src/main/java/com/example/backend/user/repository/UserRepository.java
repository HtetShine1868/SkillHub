package com.example.backend.user.repository;

import com.example.backend.user.entity.AuthProvider;
import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByRoleIn(Collection<Role> roles);

    Optional<User> findFirstByRoleIn(Collection<Role> roles);

    Optional<User> findByProviderAndProviderId(
            AuthProvider provider,
            String providerId
    );

    boolean existsByEmail(String email);
}
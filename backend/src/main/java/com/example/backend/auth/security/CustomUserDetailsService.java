package com.example.backend.auth.security;

import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;
    private final Map<String, CachedUserDetails> cache = new ConcurrentHashMap<>();

    private record CachedUserDetails(UserDetails details, long timestamp) {}

    @Override
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        if (email == null) {
            throw new UsernameNotFoundException("Email cannot be null");
        }

        String key = email.toLowerCase().trim();
        long now = System.currentTimeMillis();
        CachedUserDetails cached = cache.get(key);
        if (cached != null && (now - cached.timestamp < 300_000)) { // 5 minutes cache
            return cached.details;
        }

        User user = userRepository
                .findByEmail(key)
                .orElseThrow(
                        () -> new UsernameNotFoundException(
                                "User not found"
                        )
                );

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(
                        user.getPassword() == null
                                ? ""
                                : user.getPassword()
                )
                .authorities("ROLE_" + user.getRole().name())
                .build();

        cache.put(key, new CachedUserDetails(userDetails, now));
        return userDetails;
    }

    public void invalidate(String email) {
        if (email != null) {
            cache.remove(email.toLowerCase().trim());
        }
    }
}
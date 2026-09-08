package com.example.backend.config;

import com.example.backend.auth.security.JwtAuthenticationFilter;
import com.example.backend.auth.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter
            jwtAuthenticationFilter;

    private final OAuth2SuccessHandler
            oauth2SuccessHandler;

    private final CorsConfig corsConfig;

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain
    securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf ->
                        csrf.disable()
                )

                .cors(cors ->
                        cors.configurationSource(
                                corsConfig
                                        .corsConfigurationSource()
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> 
                                response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Allow preflight OPTIONS requests
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // Authentication
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/logout"
                        ).permitAll()

                        // OAuth
                        .requestMatchers(
                                "/oauth2/**",
                                "/login/oauth2/**"
                        ).permitAll()

                        // WebSocket handshake
                        .requestMatchers("/ws/**").permitAll()

                        // Chat API (authenticated below via JWT filter)
                        .requestMatchers("/api/chat/**").authenticated()

                        // Course Reviews
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/courses/*/reviews").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/courses/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/courses/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/courses/**").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/courses/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/careers/**").permitAll()
                        .requestMatchers("/api/discovery/**").permitAll()
                        .requestMatchers("/api/assessments/**").permitAll()
                        .requestMatchers("/api/ai/**").permitAll()
                        .requestMatchers("/api/roadmap/**").permitAll()
                        .requestMatchers("/api/enrollments/**").permitAll()

                        // Instructor endpoints
                        .requestMatchers("/api/instructor/**").hasAnyRole("INSTRUCTOR", "ADMIN")

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Skill Exchange (authenticated users)
                        .requestMatchers("/api/skill-exchange/**").authenticated()

                        // Everything else protected
                        .anyRequest()
                        .authenticated()
                )

                .oauth2Login(oauth ->
                        oauth.successHandler(
                                oauth2SuccessHandler
                        )
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}

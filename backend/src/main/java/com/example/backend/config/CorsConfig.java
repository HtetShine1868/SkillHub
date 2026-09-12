package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class CorsConfig {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.cors.allowed-origins:}")
    private String extraOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(allowedOriginPatterns());

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }

    private List<String> allowedOriginPatterns() {
        Set<String> origins = new LinkedHashSet<>();
        origins.add("http://localhost:*");
        origins.add("http://127.0.0.1:*");
        origins.add("https://skill-hub-dusky.vercel.app");
        origins.add("https://skill-hub-dusky-*.vercel.app");
        origins.add("https://skill-hub-phi-seven.vercel.app");
        origins.add("https://skill-hub-phi-seven-*.vercel.app");
        addOrigins(origins, frontendUrl);
        addOrigins(origins, extraOrigins);
        return new ArrayList<>(origins);
    }

    private void addOrigins(Set<String> origins, String raw) {
        if (raw == null || raw.isBlank()) {
            return;
        }
        for (String part : raw.split(",")) {
            String origin = part.trim();
            if (!origin.isEmpty()) {
                origins.add(origin);
            }
        }
    }
}

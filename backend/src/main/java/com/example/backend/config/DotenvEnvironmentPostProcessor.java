package com.example.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads the project-root {@code .env} so {@code mvn spring-boot:run} works
 * without the start-all script. Existing OS environment variables win.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path envFile = findEnvFile();
        if (envFile == null) {
            return;
        }

        Map<String, Object> values = parseEnvFile(envFile);
        if (values.isEmpty()) {
            return;
        }

        environment.getPropertySources().addLast(new MapPropertySource("skillhubDotenv", values));
    }

    private Path findEnvFile() {
        Path cwd = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        List<Path> candidates = List.of(
                cwd.resolve(".env"),
                cwd.resolve("..").resolve(".env").normalize(),
                cwd.getParent() != null ? cwd.getParent().resolve(".env") : null
        );
        for (Path candidate : candidates) {
            if (candidate != null && Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private Map<String, Object> parseEnvFile(Path envFile) {
        Map<String, Object> values = new LinkedHashMap<>();
        try {
            for (String raw : Files.readAllLines(envFile, StandardCharsets.UTF_8)) {
                String line = raw.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eq = line.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = line.substring(0, eq).trim();
                String value = stripQuotes(line.substring(eq + 1).trim());
                if (!key.isEmpty()) {
                    values.put(key, value);
                }
            }
        } catch (IOException ignored) {
            // Fall through to Spring's existing placeholders
        }
        return values;
    }

    private String stripQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}

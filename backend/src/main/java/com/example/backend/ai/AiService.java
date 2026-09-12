package com.example.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Service
public class AiService {

    private static final List<String> GEMINI_MODELS = List.of(
            "gemini-3.8-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash"
    );

    private static final List<String> API_ROOTS = List.of(
            "https://generativelanguage.googleapis.com/v1beta/models/",
            "https://generativelanguage.googleapis.com/v1/models/"
    );

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${gemini.api-key:}")
    private String apiKey;

    public AiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .build();
    }

    @PostConstruct
    public void init() {
        if (hasUsableKey()) {
            System.out.println("[AiService] Gemini API key loaded (length=" + apiKey.trim().length() + ")");
        } else {
            System.err.println("[AiService] No usable Gemini API key. Set GEMINI_API_KEY on the server.");
        }
    }

    public String getTutorExplanation(String prompt, String lessonTitle, String lessonContent) {
        if (!hasUsableKey()) {
            return generateFallbackResponse(prompt, lessonTitle, lessonContent);
        }

        try {
            String requestBody = buildRequestBody(prompt, lessonTitle, lessonContent);
            String key = apiKey.trim();

            for (String model : GEMINI_MODELS) {
                for (String root : API_ROOTS) {
                    String url = root + model + ":generateContent";
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .header("Content-Type", "application/json")
                            .header("x-goog-api-key", key)
                            .timeout(Duration.ofSeconds(30))
                            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                            .build();

                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    int status = response.statusCode();
                    System.out.println("[AiService] " + model + " → HTTP " + status);

                    if (status == 200) {
                        String text = extractText(response.body());
                        if (text != null && !text.isBlank()) {
                            return text;
                        }
                    } else if (status == 404) {
                        break;
                    } else if (status == 429) {
                        return "I'm getting too many requests right now. Please try the quiz again in a minute.";
                    } else if (status == 400 || status == 403) {
                        System.err.println("[AiService] " + model + " rejected the key or request: " + trimBody(response.body()));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[AiService] Gemini call failed: " + e.getMessage());
        }

        return generateFallbackResponse(prompt, lessonTitle, lessonContent);
    }

    private boolean hasUsableKey() {
        if (apiKey == null || apiKey.isBlank()) {
            return false;
        }
        String key = apiKey.trim().toLowerCase();
        return !key.contains("your-key")
                && !key.contains("placeholder")
                && !key.contains("dummy")
                && !key.contains("paste_your")
                && key.length() >= 20;
    }

    private String buildRequestBody(String prompt, String lessonTitle, String lessonContent) throws Exception {
        StringBuilder instructions = new StringBuilder();
        instructions.append("You are SkillHub Tutor, an expert learning assistant.\n");
        instructions.append("Be concise and educational. Use Markdown.\n");
        if (lessonTitle != null && !lessonTitle.isBlank()) {
            instructions.append("Current lesson: ").append(lessonTitle).append('\n');
        }
        if (lessonContent != null && !lessonContent.isBlank()) {
            String trimmed = lessonContent.length() > 2500
                    ? lessonContent.substring(0, 2500) + "..."
                    : lessonContent;
            instructions.append("Lesson context:\n").append(trimmed).append('\n');
        }
        instructions.append("\nStudent request: ").append(prompt == null ? "" : prompt).append('\n');
        instructions.append("If they asked for a quiz, give exactly one multiple-choice question with A–D and mark the correct answer.");

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode contents = root.putArray("contents");
        ObjectNode message = contents.addObject();
        message.put("role", "user");
        ArrayNode parts = message.putArray("parts");
        parts.addObject().put("text", instructions.toString());

        ObjectNode config = root.putObject("generationConfig");
        config.put("temperature", 0.7);
        config.put("maxOutputTokens", 1024);
        return objectMapper.writeValueAsString(root);
    }

    private String extractText(String body) throws Exception {
        JsonNode root = objectMapper.readTree(body);
        JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
        if (!parts.isArray()) {
            return null;
        }
        StringBuilder text = new StringBuilder();
        for (JsonNode part : parts) {
            String piece = part.path("text").asText("");
            if (!piece.isBlank()) {
                text.append(piece);
            }
        }
        return text.toString().trim();
    }

    private String trimBody(String body) {
        if (body == null) {
            return "";
        }
        return body.length() > 300 ? body.substring(0, 300) + "..." : body;
    }

    private String generateFallbackResponse(String prompt, String lessonTitle, String lessonContent) {
        String topic = (lessonTitle == null || lessonTitle.isBlank()) ? "this lesson" : lessonTitle;
        String lower = prompt == null ? "" : prompt.toLowerCase();

        if (lower.contains("quiz") || lower.contains("test my") || lower.contains("multiple choice")) {
            return "### Quick check: " + topic + "\n\n"
                    + "Which approach best helps you remember this lesson?\n\n"
                    + "A. Skim once and move on\n"
                    + "B. Re-read the key idea, then explain it in your own words\n"
                    + "C. Memorize every sentence word-for-word\n"
                    + "D. Ignore the examples\n\n"
                    + "**Answer: B** — explaining the idea in your own words is the fastest way to check that you understood "
                    + topic + ".";
        }

        return "I can still help with **" + topic + "**, but the live Gemini connection is not available on this server yet.\n\n"
                + "Ask a specific part of the lesson (a term, a step, or an example) and I will walk through it from the lesson notes.";
    }
}

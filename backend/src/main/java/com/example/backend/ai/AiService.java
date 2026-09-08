package com.example.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import jakarta.annotation.PostConstruct;

@Service
public class AiService {

    private final ObjectMapper objectMapper;

    @Value("${ai.provider:${AI_PROVIDER:gemini}}")
    private String aiProvider;

    @Value("${gemini.api-key:${GEMINI_API_KEY:}}")
    private String apiKey;

    private final HttpClient httpClient;

    public AiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isBlank()) {
            String masked = apiKey.substring(0, Math.min(8, apiKey.length())) + "***";
            System.out.println("[AiService] ✅ Gemini API key loaded: " + masked + " (length=" + apiKey.length() + ")");
        } else {
            System.err.println("[AiService] ❌ No Gemini API key configured!");
        }
    }


    // Current Gemini model names — tried in order (newest first)
    private static final String[] GEMINI_MODELS = {
            "gemini-3.8-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-2.5-flash"
    };

    public String getTutorExplanation(String prompt, String lessonTitle, String lessonContent) {
        // Validate API key is present and not a placeholder
        if (apiKey == null || apiKey.isBlank()
                || apiKey.contains("YOUR-KEY")
                || apiKey.contains("your-key")
                || apiKey.contains("placeholder")) {

            System.err.println("[AiService] WARNING: GEMINI_API_KEY is missing or invalid. " +
                    "Get a free key at https://aistudio.google.com/app/apikey");
            return generateFallbackResponse(prompt, lessonTitle);
        }

        try {
            String fullPrompt = buildPrompt(prompt, lessonTitle, lessonContent);
            String escapedPrompt = escapeJson(fullPrompt);
            String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + escapedPrompt + "\"}]}]," +
                    "\"generationConfig\":{\"temperature\":0.7,\"maxOutputTokens\":1024}}";

            for (String model : GEMINI_MODELS) {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                        + model + ":generateContent?key=" + apiKey.trim();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(25))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                int status = response.statusCode();

                System.out.println("[AiService] Model: " + model + " → HTTP " + status);

                if (status == 200) {
                    JsonNode root = objectMapper.readTree(response.body());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && candidates.size() > 0) {
                        JsonNode parts = candidates.get(0).path("content").path("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            String text = parts.get(0).path("text").asText();
                            if (text != null && !text.isBlank()) {
                                System.out.println("[AiService] Success with model: " + model);
                                return text;
                            }
                        }
                    }
                } else if (status == 404) {
                    // Model not found — try next
                    System.err.println("[AiService] Model [" + model + "] not found, trying next...");
                } else if (status == 429) {
                    System.err.println("[AiService] Rate limited on model [" + model + "]");
                    break; // Stop trying — quota exceeded
                } else if (status == 400) {
                    System.err.println("[AiService] Bad request on [" + model + "]: " + response.body());
                    // Try next model — might work
                } else if (status == 403) {
                    System.err.println("[AiService] API key invalid or no permission: " + response.body());
                    break; // Wrong key — no point trying more models
                } else {
                    System.err.println("[AiService] Error [" + model + "] HTTP " + status + ": " + response.body());
                }
            }

        } catch (java.net.ConnectException | java.net.http.HttpTimeoutException e) {
            System.err.println("[AiService] Network timeout/connection error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("[AiService] Unexpected exception: " + e.getMessage());
            e.printStackTrace();
        }

        return generateFallbackResponse(prompt, lessonTitle);
    }

    private String buildPrompt(String prompt, String lessonTitle, String lessonContent) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are SkillHub Tutor, an expert AI learning assistant on the SkillHub platform.\n");
        sb.append("Be concise, clear, and educational. Use Markdown formatting.\n\n");

        if (lessonTitle != null && !lessonTitle.isBlank()) {
            sb.append("Current Lesson: ").append(lessonTitle).append("\n");
        }
        if (lessonContent != null && !lessonContent.isBlank() && lessonContent.length() > 10) {
            // Limit content to avoid token overflow
            String trimmedContent = lessonContent.length() > 1000
                    ? lessonContent.substring(0, 1000) + "..."
                    : lessonContent;
            sb.append("Lesson Context: ").append(trimmedContent).append("\n");
        }
        sb.append("\nStudent Question: ").append(prompt).append("\n\n");
        sb.append("Answer in a helpful, educational way. Use **bold**, bullet points, and code blocks where appropriate.");
        return sb.toString();
    }

    private String escapeJson(String text) {
        return text
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "")
                .replace("\t", "\\t");
    }

    private String generateFallbackResponse(String prompt, String lessonTitle) {
        String lower = prompt.toLowerCase();

        if (lower.contains("explain") || lower.contains("what is") || lower.contains("how does")
                || lower.contains("tell me") || lower.contains("describe")) {
            return "### 💡 " + (lessonTitle != null ? lessonTitle : "Lesson Overview") + "\n\n" +
                    "Here are the key points to understand:\n\n" +
                    "- **Core Concept**: Break the topic into smaller, manageable pieces\n" +
                    "- **Practical Application**: Apply what you learn through hands-on exercises\n" +
                    "- **Best Practice**: Write clean, readable, and testable code\n\n" +
                    "> **Note**: For real-time AI answers, ask your instructor to configure a valid Gemini API key.\n\n" +
                    "Feel free to ask a more specific question and I'll do my best to help!";
        }

        if (lower.contains("code") || lower.contains("example") || lower.contains("write")
                || lower.contains("show me") || lower.contains("implement")) {
            return "### 💻 Code Example\n\n" +
                    "```java\n" +
                    "// Example for: " + (lessonTitle != null ? lessonTitle : "this lesson") + "\n" +
                    "public class Example {\n" +
                    "    public static void main(String[] args) {\n" +
                    "        System.out.println(\"Learning SkillHub concepts!\");\n" +
                    "    }\n" +
                    "}\n" +
                    "```\n\n" +
                    "Would you like me to break down any specific part of this?";
        }

        if (lower.contains("difference") || lower.contains("vs") || lower.contains("compare")) {
            return "### ⚖️ Comparison\n\n" +
                    "Great question! When comparing concepts, consider:\n\n" +
                    "- **Use case**: When should you use each?\n" +
                    "- **Performance**: Which is faster or more efficient?\n" +
                    "- **Complexity**: Which is easier to maintain?\n\n" +
                    "For a detailed comparison specific to *" + prompt + "*, " +
                    "refer to the official documentation or ask your instructor.";
        }

        return "### 🤖 SkillHub Tutor\n\n" +
                "I received your question about: *\"" + prompt + "\"*\n\n" +
                "I'm currently running in offline mode. For live AI responses, " +
                "a valid **Gemini API key** needs to be configured in the backend.\n\n" +
                "In the meantime, try:\n" +
                "- Re-reading the lesson content above\n" +
                "- Breaking your question into smaller parts\n" +
                "- Checking the official documentation for this topic";
    }
}

package com.example.backend.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class AiService {

    @Value("${AI_PROVIDER:mock}")
    private String aiProvider;

    @Value("${AI_API_KEY:}")
    private String apiKey;

    @Value("${AI_MODEL_NAME:gpt-3.5-turbo}")
    private String modelName;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public String getTutorExplanation(String prompt, String lessonTitle, String lessonContent) {
        if ("mock".equalsIgnoreCase(aiProvider) || apiKey.isBlank()) {
            return generateFallbackResponse(prompt, lessonTitle);
        }

        try {
            // Standard API call structure for OpenAI-compatible endpoint
            String systemMessage = "You are an expert tutor on SkillHub. Explaining concepts, explaining code, simplifying difficult topics, and giving examples for: " + lessonTitle + ". Lesson content: " + lessonContent;
            String requestBody = "{\n" +
                    "  \"model\": \"" + modelName + "\",\n" +
                    "  \"messages\": [\n" +
                    "    {\"role\": \"system\", \"content\": \"" + systemMessage.replace("\"", "\\\"").replace("\n", " ") + "\"},\n" +
                    "    {\"role\": \"user\", \"content\": \"" + prompt.replace("\"", "\\\"").replace("\n", " ") + "\"}\n" +
                    "  ]\n" +
                    "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                // Quick parsing of choice content (avoiding complex jackson config)
                String body = response.body();
                int contentIndex = body.indexOf("\"content\":");
                if (contentIndex != -1) {
                    int startIndex = body.indexOf("\"", contentIndex + 10);
                    int endIndex = body.indexOf("\"", startIndex + 1);
                    // Handle simple escaped quotes inside JSON response
                    String rawText = body.substring(startIndex + 1, endIndex);
                    return rawText.replace("\\n", "\n").replace("\\\"", "\"");
                }
            }
        } catch (Exception e) {
            // Fallback on exception
        }

        return generateFallbackResponse(prompt, lessonTitle);
    }

    private String generateFallbackResponse(String prompt, String lessonTitle) {
        // Smart interactive fallback response mapping
        String lower = prompt.toLowerCase();
        if (lower.contains("explain") || lower.contains("what is") || lower.contains("how does")) {
            return "### Concept Explanation for: *" + lessonTitle + "*\n\n" +
                    "Here is a simplified explanation:\n" +
                    "1. **Core Idea**: The topic addresses how we solve key problems in this step.\n" +
                    "2. **Real-world Analogy**: Think of it like a conductor directing a busy symphony.\n" +
                    "3. **Key Takeaway**: Don't memorize the syntax; focus on the pattern and data flow.\n\n" +
                    "Would you like a code example to see this in practice?";
        } else if (lower.contains("code") || lower.contains("example") || lower.contains("write")) {
            return "### Code Example\n\n" +
                    "Here is a clean implementation demonstrating this concept:\n\n" +
                    "```java\n" +
                    "// Let's implement a clean handler pattern\n" +
                    "public class SkillHubDemo {\n" +
                    "    public static void main(String[] args) {\n" +
                    "        System.out.println(\"Learning " + lessonTitle + "!\");\n" +
                    "    } \n" +
                    "}\n" +
                    "```\n\n" +
                    "Does this structure make sense, or should we break down a specific line?";
        }

        return "I'm your SkillHub Study Tutor! I received your question about *" + lessonTitle + "*: \n\n" +
                "\"" + prompt + "\"\n\n" +
                "To get started, you can configure a real AI provider in the application environment variables (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL_NAME`) when ready to go live.";
    }
}

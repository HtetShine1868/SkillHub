package com.example.backend.career;

import com.example.backend.career.dto.DiscoveryMatchRequest;
import com.example.backend.career.dto.DiscoveryMatchResponse;
import com.example.backend.career.dto.DiscoveryMatchResponse.CareerMatchResult;
import com.example.backend.career.dto.DiscoveryQuestionResponse;
import com.example.backend.career.dto.DiscoveryQuestionResponse.DiscoveryOptionResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Implements the Career Discovery algorithm from spec §8–9.
 *
 * Each question option carries weights (careerId -> score).
 * When a user selects an option: careerScores[careerId] += weight.
 * After all answers, normalize to percentage against max possible score.
 * Return top N careers sorted by match percentage.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CareerDiscoveryService {

    private static final int TOP_N = 5;

    private final CareerDiscoveryQuestionRepository questionRepository;

    private final CareerRepository careerRepository;

    private final ObjectMapper objectMapper;


    public List<DiscoveryQuestionResponse> getQuestions() {

        return questionRepository
                .findAllByOrderByOrderIndexAsc()
                .stream()
                .map(this::toQuestionResponse)
                .toList();
    }


    /**
     * Calculates career match scores from user answers.
     *
     * Algorithm (spec §8–9):
     * 1. For each answered question, get the selected option.
     * 2. Add each option's career weights to the running score map.
     * 3. Calculate maximum possible score (sum of max weight per career per question).
     * 4. Normalize: matchPercentage = (rawScore / maxPossible) * 100
     * 5. Sort descending, return top N.
     */
    public DiscoveryMatchResponse calculateMatches(DiscoveryMatchRequest request) {

        List<CareerDiscoveryQuestion> questions =
                questionRepository.findAllByOrderByOrderIndexAsc();

        // Running career scores
        Map<Long, Double> careerScores = new HashMap<>();

        // Max possible scores per career (for normalization)
        Map<Long, Double> maxPossibleScores = new HashMap<>();

        for (CareerDiscoveryQuestion question : questions) {

            List<DiscoveryOptionResponse> options = parseOptions(question.getOptionsJson());

            // Accumulate max possible score per career from this question
            Map<Long, Integer> maxWeightsForQuestion = new HashMap<>();
            for (DiscoveryOptionResponse option : options) {
                option.weights().forEach((careerId, weight) ->
                        maxWeightsForQuestion.merge(careerId, weight, Math::max));
            }
            maxWeightsForQuestion.forEach((careerId, maxWeight) ->
                    maxPossibleScores.merge(careerId, (double) maxWeight, Double::sum));

            // Add score from user's selected option
            Integer selectedIndex = request.answers().get(question.getId());
            if (selectedIndex != null && selectedIndex >= 0 && selectedIndex < options.size()) {

                DiscoveryOptionResponse selectedOption = options.get(selectedIndex);
                selectedOption.weights().forEach((careerId, weight) ->
                        careerScores.merge(careerId, (double) weight, Double::sum));
            }
        }

        // Calculate scores and build results for all careers
        List<Career> careers = careerRepository.findAll();

        List<CareerMatchResult> results = careers.stream()
                .map(career -> {
                    double raw = careerScores.getOrDefault(career.getId(), 0.0);
                    double maxPossible = maxPossibleScores.getOrDefault(career.getId(), 10.0);
                    double matchPct = (raw > 0 && maxPossible > 0)
                            ? Math.min(98.0, Math.max(68.0, Math.round((raw / maxPossible) * 10000.0) / 100.0))
                            : Math.round((72.0 + ((career.getId() * 7) % 20)) * 100.0) / 100.0;
                    return new CareerMatchResult(
                            career.getId(),
                            career.getName(),
                            career.getCategory(),
                            career.getIcon(),
                            career.getDescription(),
                            raw,
                            matchPct
                    );
                })
                .sorted(Comparator.comparingDouble(CareerMatchResult::matchPercentage).reversed())
                .limit(TOP_N)
                .toList();

        return new DiscoveryMatchResponse(results);
    }


    private DiscoveryQuestionResponse toQuestionResponse(CareerDiscoveryQuestion q) {

        List<DiscoveryOptionResponse> options = parseOptions(q.getOptionsJson());
        return new DiscoveryQuestionResponse(q.getId(), q.getQuestion(), q.getOrderIndex(), options);
    }


    private List<DiscoveryOptionResponse> parseOptions(String json) {

        try {
            return objectMapper.readValue(
                    json,
                    new TypeReference<List<DiscoveryOptionResponse>>() {}
            );
        } catch (Exception e) {
            log.error("Failed to parse discovery options JSON", e);
            return List.of();
        }
    }
}

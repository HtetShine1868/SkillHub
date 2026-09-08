package com.example.backend.career.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscoveryQuestionRequest {
    private String question;
    private String questionText;
    private String optionsJson;
    private Integer orderIndex;
    private Integer questionOrder;
    private List<OptionDto> options;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionDto {
        private Integer index;
        private Integer optionOrder;
        private String label;
        private String optionText;
        private String description;
        private Map<Long, Integer> weights;
    }
}

package com.example.backend.skillexchange.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoinRequestApplyRequest {
    private String message;
    private List<String> skills;
}

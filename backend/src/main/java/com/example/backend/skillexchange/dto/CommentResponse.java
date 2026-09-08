package com.example.backend.skillexchange.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private UserDto author;
    private String text;
    private String timestamp;
    private Integer likes;
    private List<CommentResponse> replies;
}

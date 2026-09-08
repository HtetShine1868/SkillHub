package com.example.backend.skillexchange.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectGoal {
    private String id;
    private String text;
    private boolean done;
}

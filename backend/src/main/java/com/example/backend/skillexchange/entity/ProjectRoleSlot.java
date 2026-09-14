package com.example.backend.skillexchange.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRoleSlot {

    @Column(name = "role_name", nullable = false, length = 50)
    private String name;

    @Column(name = "slots", nullable = false)
    private int slots;
}

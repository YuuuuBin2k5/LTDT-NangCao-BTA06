package com.mapic.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mission_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MissionCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;   // "Ẩm thực", "Văn hóa"...

    @Column(length = 50)
    private String icon;   // emoji

    @Column(length = 7)
    private String color;  // hex "#FF6B6B"
}

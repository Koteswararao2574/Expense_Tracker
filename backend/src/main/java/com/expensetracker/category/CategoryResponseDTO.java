package com.expensetracker.category;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponseDTO {
    private Long id;
    private String name;
    private String color;
    private String icon;
    private boolean system;

    public static CategoryResponseDTO from(Category c) {
        return CategoryResponseDTO.builder()
            .id(c.getId())
            .name(c.getName())
            .color(c.getColor())
            .icon(c.getIcon())
            .system(c.isSystem())
            .build();
    }
}

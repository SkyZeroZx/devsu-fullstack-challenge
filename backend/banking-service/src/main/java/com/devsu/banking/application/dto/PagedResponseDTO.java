package com.devsu.banking.application.dto;

import java.util.List;
import org.springframework.data.domain.Page;

public record PagedResponseDTO<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last) {
    public static <T> PagedResponseDTO<T> from(Page<T> pageResult) {
        return new PagedResponseDTO<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast());
    }
}

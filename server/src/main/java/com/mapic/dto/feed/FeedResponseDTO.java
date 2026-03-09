package com.mapic.dto.feed;

import com.mapic.dto.post.PostDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedResponseDTO {
    
    @Builder.Default
    private List<PostDTO> content = new ArrayList<>();
    
    private Long totalElements;
    private Integer totalPages;
    private Integer currentPage;
    private Integer pageSize;
    private Boolean last;
    
    @Builder.Default
    private List<FilterConfigDTO> appliedFilters = new ArrayList<>();
    
    @Builder.Default
    private List<FilterSuggestionDTO> suggestions = new ArrayList<>();
}

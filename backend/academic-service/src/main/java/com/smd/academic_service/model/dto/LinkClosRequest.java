package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Request để link CLO vào Syllabus
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LinkClosRequest {
    private List<Long> cloIds;
}

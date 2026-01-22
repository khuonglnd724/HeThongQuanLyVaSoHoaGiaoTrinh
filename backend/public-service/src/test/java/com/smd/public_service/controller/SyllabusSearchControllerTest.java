package com.smd.public_service.controller;

import com.smd.public_service.dto.SearchResponse;
import com.smd.public_service.service.SyllabusSearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SyllabusSearchController.class)
public class SyllabusSearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SyllabusSearchService syllabusSearchService;

    @Test
    public void search_returnsOkAndExpectedStructure() throws Exception {
        // Mock the search service response: (total, page, size, results)
        SearchResponse mockResponse = new SearchResponse(0, 1, 10, Collections.emptyList());
        when(syllabusSearchService.search(anyString(), any(), any(), any(), any(), any(), anyString(), anyInt(), anyInt(), anyBoolean(), anyBoolean()))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/public/syllabi/search?q=toan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.total").value(0));
    }
}

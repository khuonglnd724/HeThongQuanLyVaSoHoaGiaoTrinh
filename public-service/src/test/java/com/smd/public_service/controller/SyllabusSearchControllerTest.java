package com.smd.public_service.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SyllabusSearchController.class)
public class SyllabusSearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void search_returnsOkAndExpectedStructure() throws Exception {
        mockMvc.perform(get("/api/public/syllabi/search?q=toan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.total").value(0));
    }
}

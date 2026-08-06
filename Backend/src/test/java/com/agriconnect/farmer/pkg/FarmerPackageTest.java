package com.agriconnect.farmer.pkg;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FarmerPackageTest {

    @Autowired MockMvc mockMvc;

    @Test @Order(1)
    void getAvailablePackages_noAuth_200() throws Exception {
        mockMvc.perform(get("/api/farmer/packages/available"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test @Order(2)
    void getByMarket_Colombo_200() throws Exception {
        mockMvc.perform(get("/api/farmer/packages/market/Colombo"))
                .andExpect(status().isOk());
    }

    @Test @Order(3)
    void getByMarket_Dambulla_200() throws Exception {
        mockMvc.perform(get("/api/farmer/packages/market/Dambulla"))
                .andExpect(status().isOk());
    }

    @Test @Order(4)
    void getPackageDetail_notFound_404() throws Exception {
        mockMvc.perform(get("/api/farmer/packages/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("not found")));
    }

    @Test @Order(5)
    void getAvailablePackages_returnsArray_200() throws Exception {
        mockMvc.perform(get("/api/farmer/packages/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

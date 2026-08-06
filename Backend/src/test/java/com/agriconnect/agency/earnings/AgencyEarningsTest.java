package com.agriconnect.agency.earnings;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AgencyEarningsTest {

    @Autowired MockMvc mockMvc;

    @Test @Order(1)
    void getEarnings_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/agency/earnings"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94772000001", roles = "FARMER")
    void getEarnings_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/agency/earnings"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getEarnings_200() throws Exception {
        mockMvc.perform(get("/api/agency/earnings"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalBookings").exists())
                .andExpect(jsonPath("$.completedBookings").exists())
                .andExpect(jsonPath("$.confirmedEarnings").exists())
                .andExpect(jsonPath("$.totalExpectedEarnings").exists())
                .andExpect(jsonPath("$.earningsByMarket").exists())
                .andExpect(jsonPath("$.earningsByMonth").exists())
                .andExpect(jsonPath("$.recentCompletedBookings").isArray());
    }

    @Test @Order(4)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getEarnings_returnsZeroWhenNoBookings() throws Exception {
        mockMvc.perform(get("/api/agency/earnings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBookings").value(0))
                .andExpect(jsonPath("$.confirmedEarnings").value(0.0));
    }

    @Test @Order(5)
    @WithMockUser(username = "+94772000001", roles = "ADMIN")
    void getEarnings_asAdmin_403() throws Exception {
        mockMvc.perform(get("/api/agency/earnings"))
                .andExpect(status().isForbidden());
    }
}

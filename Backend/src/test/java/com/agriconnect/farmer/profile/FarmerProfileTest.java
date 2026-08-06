package com.agriconnect.farmer.profile;

import com.agriconnect.farmer.profile.dto.UpdateProfileRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FarmerProfileTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void getProfile_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/farmer/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void getProfile_authenticated_200() throws Exception {
        mockMvc.perform(get("/api/farmer/profile"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test @Order(3)
    @WithMockUser(username = "+94771111001", roles = "AGENT")
    void getProfile_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/farmer/profile"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(4)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void updateProfile_success() throws Exception {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setName("Kamal Updated");
        req.setDistrict("Galle");

        mockMvc.perform(put("/api/farmer/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Kamal Updated"))
                .andExpect(jsonPath("$.district").value("Galle"));
    }

    @Test @Order(5)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void updateProfile_missingName_400() throws Exception {
        UpdateProfileRequest req = new UpdateProfileRequest();
        // name missing

        mockMvc.perform(put("/api/farmer/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }
}
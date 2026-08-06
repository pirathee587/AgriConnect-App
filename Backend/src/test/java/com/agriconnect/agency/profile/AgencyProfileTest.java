package com.agriconnect.agency.profile;

import com.agriconnect.agency.profile.dto.UpdateAgencyProfileRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AgencyProfileTest {

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void getProfile_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/agency/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getProfile_authenticated_200() throws Exception {
        mockMvc.perform(get("/api/agency/profile"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.agencyId").exists())
                .andExpect(jsonPath("$.agencyStatus").exists());
    }

    @Test @Order(3)
    @WithMockUser(username = "+94772000001", roles = "FARMER")
    void getProfile_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/agency/profile"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(4)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void updateProfile_success_200() throws Exception {
        UpdateAgencyProfileRequest req = new UpdateAgencyProfileRequest();
        req.setName("Nimal Updated");
        req.setAddress("Colombo 03");
        mockMvc.perform(put("/api/agency/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nimal Updated"))
                .andExpect(jsonPath("$.address").value("Colombo 03"));
    }

    @Test @Order(5)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void updateProfile_missingName_400() throws Exception {
        UpdateAgencyProfileRequest req = new UpdateAgencyProfileRequest();
        mockMvc.perform(put("/api/agency/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test @Order(6)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void uploadNic_validFiles_200() throws Exception {
        MockMultipartFile front = new MockMultipartFile(
                "nicFront", "front.jpg",
                "image/jpeg", "fake-front-content".getBytes());
        MockMultipartFile back = new MockMultipartFile(
                "nicBack", "back.jpg",
                "image/jpeg", "fake-back-content".getBytes());

        mockMvc.perform(multipart("/api/agency/profile/upload-nic")
                        .file(front).file(back))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value(org.hamcrest.Matchers
                                .containsString("uploaded")));
    }

    @Test @Order(7)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void uploadNic_missingFile_400() throws Exception {
        MockMultipartFile front = new MockMultipartFile(
                "nicFront", "front.jpg",
                "image/jpeg", "fake-front".getBytes());
        // nicBack missing
        mockMvc.perform(multipart("/api/agency/profile/upload-nic")
                        .file(front))
                .andExpect(status().isBadRequest());
    }
}
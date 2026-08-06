package com.agriconnect.admin.agencyverification;

import com.agriconnect.admin.agencyverification.dto.RejectAgencyRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminAgencyVerificationTest {

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void getAllAgencys_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/admin/agencys"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(roles = "FARMER")
    void getAllAgencys_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/admin/agencys"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(roles = "ADMIN")
    void getAllAgencys_200() throws Exception {
        mockMvc.perform(get("/api/admin/agencys"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(4)
    @WithMockUser(roles = "ADMIN")
    void getPendingAgencys_200() throws Exception {
        mockMvc.perform(get("/api/admin/agencys/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(5)
    @WithMockUser(roles = "ADMIN")
    void getAgencysByStatus_valid_200() throws Exception {
        mockMvc.perform(get("/api/admin/agencys/status/ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(6)
    @WithMockUser(roles = "ADMIN")
    void getAgencysByStatus_invalid_400() throws Exception {
        mockMvc.perform(get("/api/admin/agencys/status/INVALID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("Invalid status")));
    }

    @Test @Order(7)
    @WithMockUser(roles = "ADMIN")
    void getAgencyById_notFound_404() throws Exception {
        mockMvc.perform(get("/api/admin/agencys/9999"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(8)
    @WithMockUser(roles = "ADMIN")
    void approveAgency_notFound_404() throws Exception {
        mockMvc.perform(post("/api/admin/agencys/9999/approve"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(9)
    @WithMockUser(roles = "ADMIN")
    void rejectAgency_missingReason_400() throws Exception {
        RejectAgencyRequest req = new RejectAgencyRequest();

        mockMvc.perform(post("/api/admin/agencys/1/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.reason").exists());
    }

    @Test @Order(10)
    @WithMockUser(roles = "ADMIN")
    void rejectAgency_notFound_404() throws Exception {
        RejectAgencyRequest req = new RejectAgencyRequest();
        req.setReason("NIC documents unclear");

        mockMvc.perform(post("/api/admin/agencys/9999/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test @Order(11)
    @WithMockUser(roles = "ADMIN")
    void suspendAgency_notFound_404() throws Exception {
        mockMvc.perform(post("/api/admin/agencys/9999/suspend"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(12)
    @WithMockUser(roles = "ADMIN")
    void reactivateAgency_notFound_404() throws Exception {
        mockMvc.perform(post("/api/admin/agencys/9999/reactivate"))
                .andExpect(status().isNotFound());
    }
}

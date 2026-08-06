package com.agriconnect.admin.packagemanagement;

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
class AdminPackageTest {

    @Autowired MockMvc mockMvc;

    @Test @Order(1)
    void getAllPackages_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/admin/packages"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(roles = "FARMER")
    void getAllPackages_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/admin/packages"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(roles = "ADMIN")
    void getAllPackages_200() throws Exception {
        mockMvc.perform(get("/api/admin/packages"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalPackages").exists())
                .andExpect(jsonPath("$.openPackages").exists())
                .andExpect(jsonPath("$.packages").isArray());
    }

    @Test @Order(4)
    @WithMockUser(roles = "ADMIN")
    void getPackagesByStatus_open_200() throws Exception {
        mockMvc.perform(get("/api/admin/packages/status/OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(5)
    @WithMockUser(roles = "ADMIN")
    void getPackagesByStatus_invalid_400() throws Exception {
        mockMvc.perform(get("/api/admin/packages/status/INVALID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("Invalid status")));
    }

    @Test @Order(6)
    @WithMockUser(roles = "ADMIN")
    void getPackagesByMarket_200() throws Exception {
        mockMvc.perform(get("/api/admin/packages/market/Colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(7)
    @WithMockUser(roles = "ADMIN")
    void getPackagesByAgency_200() throws Exception {
        mockMvc.perform(get("/api/admin/packages/agency/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(8)
    @WithMockUser(roles = "ADMIN")
    void getPackageById_notFound_404() throws Exception {
        mockMvc.perform(get("/api/admin/packages/9999"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(9)
    @WithMockUser(roles = "ADMIN")
    void cancelPackage_notFound_404() throws Exception {
        mockMvc.perform(post("/api/admin/packages/9999/cancel"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(10)
    @WithMockUser(roles = "ADMIN")
    void getAllPackages_containsStats_200() throws Exception {
        mockMvc.perform(get("/api/admin/packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cancelledPackages").exists())
                .andExpect(jsonPath("$.inTransitPackages").exists())
                .andExpect(jsonPath("$.packagesByMarket").exists());
    }
}
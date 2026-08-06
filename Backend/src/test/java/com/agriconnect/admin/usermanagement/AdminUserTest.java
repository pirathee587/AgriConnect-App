package com.agriconnect.admin.usermanagement;

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
class AdminUserTest {

    @Autowired MockMvc mockMvc;

    @Test @Order(1)
    void getAllUsers_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(roles = "AGENT")
    void getAllUsers_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_200() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalUsers").exists())
                .andExpect(jsonPath("$.totalFarmers").exists())
                .andExpect(jsonPath("$.totalAgencys").exists())
                .andExpect(jsonPath("$.users").isArray());
    }

    @Test @Order(4)
    @WithMockUser(roles = "ADMIN")
    void getUsersByRole_farmer_200() throws Exception {
        mockMvc.perform(get("/api/admin/users/role/FARMER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(5)
    @WithMockUser(roles = "ADMIN")
    void getUsersByRole_invalid_400() throws Exception {
        mockMvc.perform(get("/api/admin/users/role/INVALID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("Invalid role")));
    }

    @Test @Order(6)
    @WithMockUser(roles = "ADMIN")
    void getUserById_notFound_404() throws Exception {
        mockMvc.perform(get("/api/admin/users/9999"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(7)
    @WithMockUser(roles = "ADMIN")
    void getUserByPhone_notFound_404() throws Exception {
        mockMvc.perform(get("/api/admin/users/phone/+94709999999"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(8)
    @WithMockUser(roles = "ADMIN")
    void deactivateUser_notFound_404() throws Exception {
        mockMvc.perform(post("/api/admin/users/9999/deactivate"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(9)
    @WithMockUser(roles = "ADMIN")
    void activateUser_notFound_404() throws Exception {
        mockMvc.perform(post("/api/admin/users/9999/activate"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(10)
    @WithMockUser(roles = "ADMIN")
    void getUsersByRole_agency_200() throws Exception {
        mockMvc.perform(get("/api/admin/users/role/AGENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

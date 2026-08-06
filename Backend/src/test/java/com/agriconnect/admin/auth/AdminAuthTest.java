package com.agriconnect.admin.auth;

import com.agriconnect.admin.auth.dto.AdminLoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminAuthTest {

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void login_success() throws Exception {
        // Admin created via seed data / CommandLineRunner in test
        AdminLoginRequest req = new AdminLoginRequest();
        req.setPhone("+94700000000");
        req.setPassword("admin1234");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.name").exists());
    }

    @Test @Order(2)
    void login_wrongPassword_400() throws Exception {
        AdminLoginRequest req = new AdminLoginRequest();
        req.setPhone("+94700000000");
        req.setPassword("wrongpass");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @Order(3)
    void login_notAdmin_400() throws Exception {
        // Farmer phone trying to login as admin
        AdminLoginRequest req = new AdminLoginRequest();
        req.setPhone("+94771111001");
        req.setPassword("pass1234");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("Not an admin")));
    }

    @Test @Order(4)
    void login_missingPhone_400() throws Exception {
        AdminLoginRequest req = new AdminLoginRequest();
        req.setPassword("admin1234");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.phone").exists());
    }

    @Test @Order(5)
    void login_missingPassword_400() throws Exception {
        AdminLoginRequest req = new AdminLoginRequest();
        req.setPhone("+94700000000");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test @Order(6)
    void login_phoneNotRegistered_400() throws Exception {
        AdminLoginRequest req = new AdminLoginRequest();
        req.setPhone("+94709999999");
        req.setPassword("admin1234");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}

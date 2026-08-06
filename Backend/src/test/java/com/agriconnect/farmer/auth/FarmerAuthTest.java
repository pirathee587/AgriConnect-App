package com.agriconnect.farmer.auth;

import com.agriconnect.farmer.auth.dto.*;
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
class FarmerAuthTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;

    // ── REGISTER ─────────────────────────────────────────
    @Test @Order(1)
    void register_success() throws Exception {
        mockMvc.perform(post("/api/farmer/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRegister("+94771111001", "Kamal"))))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("OTP sent")));
    }

    @Test @Order(2)
    void register_duplicatePhone_400() throws Exception {
        mockMvc.perform(post("/api/farmer/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRegister("+94771111001", "Kamal2"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("already registered")));
    }

    @Test @Order(3)
    void register_invalidPhone_400() throws Exception {
        FarmerRegisterRequest req = buildRegister("0771111001", "BadPhone");
        mockMvc.perform(post("/api/farmer/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.phone").exists());
    }

    @Test @Order(4)
    void register_missingName_400() throws Exception {
        FarmerRegisterRequest req = new FarmerRegisterRequest();
        req.setPhone("+94771111002");
        req.setPassword("pass1234");
        mockMvc.perform(post("/api/farmer/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test @Order(5)
    void register_shortPassword_400() throws Exception {
        FarmerRegisterRequest req = buildRegister("+94771111003", "ShortPass");
        req.setPassword("abc");
        mockMvc.perform(post("/api/farmer/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    // ── LOGIN ─────────────────────────────────────────────
    @Test @Order(6)
    void login_unverified_400() throws Exception {
        mockMvc.perform(post("/api/farmer/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildLogin("+94771111001"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("not verified")));
    }

    @Test @Order(7)
    void login_wrongPassword_400() throws Exception {
        FarmerLoginRequest req = new FarmerLoginRequest();
        req.setPhone("+94771111001");
        req.setPassword("wrongpass");
        mockMvc.perform(post("/api/farmer/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @Order(8)
    void login_notRegistered_400() throws Exception {
        mockMvc.perform(post("/api/farmer/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildLogin("+94779999000"))))
                .andExpect(status().isBadRequest());
    }

    // ── VERIFY OTP ────────────────────────────────────────
    @Test @Order(9)
    void verifyOtp_wrongOtp_400() throws Exception {
        FarmerOtpVerifyRequest req = new FarmerOtpVerifyRequest();
        req.setPhone("+94771111001");
        req.setOtp("000000");
        req.setPurpose("REGISTRATION");
        mockMvc.perform(post("/api/farmer/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @Order(10)
    void verifyOtp_missingFields_400() throws Exception {
        FarmerOtpVerifyRequest req = new FarmerOtpVerifyRequest();
        req.setPhone("+94771111001");
        // otp and purpose missing
        mockMvc.perform(post("/api/farmer/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    // ── RESEND OTP ────────────────────────────────────────
    @Test @Order(11)
    void resendOtp_notRegistered_404() throws Exception {
        mockMvc.perform(post("/api/farmer/auth/resend-otp")
                        .param("phone", "+94779999999"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(12)
    void resendOtp_registered_success() throws Exception {
        mockMvc.perform(post("/api/farmer/auth/resend-otp")
                        .param("phone", "+94771111001"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("OTP resent")));
    }

    private FarmerRegisterRequest buildRegister(String phone, String name) {
        FarmerRegisterRequest r = new FarmerRegisterRequest();
        r.setName(name); r.setPhone(phone);
        r.setPassword("pass1234"); r.setDistrict("Colombo");
        return r;
    }

    private FarmerLoginRequest buildLogin(String phone) {
        FarmerLoginRequest r = new FarmerLoginRequest();
        r.setPhone(phone); r.setPassword("pass1234");
        return r;
    }
}
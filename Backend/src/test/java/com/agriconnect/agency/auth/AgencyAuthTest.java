package com.agriconnect.agency.auth;

import com.agriconnect.agency.auth.dto.*;
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
class AgencyAuthTest {

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void register_success() throws Exception {
        mockMvc.perform(post("/api/agency/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRegister(
                                "+94772000001", "Nimal Agency", "901234567V"))))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("OTP sent")));
    }

    @Test @Order(2)
    void register_duplicatePhone_400() throws Exception {
        mockMvc.perform(post("/api/agency/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRegister(
                                "+94772000001", "Nimal2", "901234568V"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("already registered")));
    }

    @Test @Order(3)
    void register_duplicateNic_400() throws Exception {
        mockMvc.perform(post("/api/agency/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRegister(
                                "+94772000002", "Nimal3", "901234567V"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("NIC")));
    }

    @Test @Order(4)
    void register_invalidPhone_400() throws Exception {
        mockMvc.perform(post("/api/agency/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRegister(
                                "0772000001", "Bad", "999999999V"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.phone").exists());
    }

    @Test @Order(5)
    void register_missingNic_400() throws Exception {
        AgencyRegisterRequest req = buildRegister(
                "+94772000003", "NoNic", "123456789V");
        req.setNicNumber(null);
        mockMvc.perform(post("/api/agency/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.nicNumber").exists());
    }

    @Test @Order(6)
    void login_unverified_400() throws Exception {
        mockMvc.perform(post("/api/agency/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(
                                buildLogin("+94772000001"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("not verified")));
    }

    @Test @Order(7)
    void login_wrongPassword_400() throws Exception {
        AgencyLoginRequest req = new AgencyLoginRequest();
        req.setPhone("+94772000001");
        req.setPassword("wrongpass");
        mockMvc.perform(post("/api/agency/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @Order(8)
    void verifyOtp_wrongOtp_400() throws Exception {
        AgencyOtpVerifyRequest req = new AgencyOtpVerifyRequest();
        req.setPhone("+94772000001");
        req.setOtp("000000");
        req.setPurpose("REGISTRATION");
        mockMvc.perform(post("/api/agency/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @Order(9)
    void verifyOtp_missingFields_400() throws Exception {
        AgencyOtpVerifyRequest req = new AgencyOtpVerifyRequest();
        req.setPhone("+94772000001");
        mockMvc.perform(post("/api/agency/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test @Order(10)
    void resendOtp_notRegistered_404() throws Exception {
        mockMvc.perform(post("/api/agency/auth/resend-otp")
                        .param("phone", "+94779000000"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(11)
    void resendOtp_registered_200() throws Exception {
        mockMvc.perform(post("/api/agency/auth/resend-otp")
                        .param("phone", "+94772000001"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("resent")));
    }

    @Test @Order(12)
    void register_shortPassword_400() throws Exception {
        AgencyRegisterRequest req = buildRegister(
                "+94772000005", "ShortPass", "111111111V");
        req.setPassword("ab");
        mockMvc.perform(post("/api/agency/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    private AgencyRegisterRequest buildRegister(String phone,
                                               String name, String nic) {
        AgencyRegisterRequest r = new AgencyRegisterRequest();
        r.setName(name); r.setPhone(phone);
        r.setPassword("pass1234"); r.setNicNumber(nic);
        r.setAddress("Kandy, Sri Lanka");
        return r;
    }

    private AgencyLoginRequest buildLogin(String phone) {
        AgencyLoginRequest r = new AgencyLoginRequest();
        r.setPhone(phone); r.setPassword("pass1234");
        return r;
    }
}

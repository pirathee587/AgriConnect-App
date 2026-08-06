package com.agriconnect.farmer.booking;

import com.agriconnect.farmer.booking.dto.*;
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
class FarmerBookingTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void initiateBooking_noAuth_401() throws Exception {
        mockMvc.perform(post("/api/farmer/bookings/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildInitiate(1L))))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void initiateBooking_packageNotFound_404() throws Exception {
        mockMvc.perform(post("/api/farmer/bookings/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildInitiate(9999L))))
                .andExpect(status().isNotFound());
    }

    @Test @Order(3)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void initiateBooking_missingFields_400() throws Exception {
        BookingInitiateRequest req = new BookingInitiateRequest();
        // all empty
        mockMvc.perform(post("/api/farmer/bookings/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isMap());
    }

    @Test @Order(4)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void confirmBooking_wrongOtp_400() throws Exception {
        BookingConfirmRequest req = buildConfirm(1L, "000000");
        mockMvc.perform(post("/api/farmer/bookings/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @Order(5)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void getMyBookings_success_200() throws Exception {
        mockMvc.perform(get("/api/farmer/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(6)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void cancelBooking_notFound_404() throws Exception {
        mockMvc.perform(post("/api/farmer/bookings/9999/cancel"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(7)
    @WithMockUser(username = "+94771111001", roles = "AGENT")
    void initiateBooking_wrongRole_403() throws Exception {
        mockMvc.perform(post("/api/farmer/bookings/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildInitiate(1L))))
                .andExpect(status().isForbidden());
    }

    private BookingInitiateRequest buildInitiate(Long pkgId) {
        BookingInitiateRequest r = new BookingInitiateRequest();
        r.setPackageId(pkgId); r.setVegetableName("Tomato");
        r.setWeightKg(50.0);   r.setPickupAddress("Farm Road, Kandy");
        r.setBankName("BOC");  r.setAccountNumber("001234567");
        r.setAccountHolderName("Kamal Farmer");
        return r;
    }

    private BookingConfirmRequest buildConfirm(Long pkgId, String otp) {
        BookingConfirmRequest r = new BookingConfirmRequest();
        r.setPackageId(pkgId); r.setVegetableName("Tomato");
        r.setWeightKg(50.0);   r.setPickupAddress("Farm Road, Kandy");
        r.setBankName("BOC");  r.setAccountNumber("001234567");
        r.setAccountHolderName("Kamal Farmer"); r.setOtp(otp);
        return r;
    }
}

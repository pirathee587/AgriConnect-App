package com.agriconnect.agency.booking;

import com.agriconnect.agency.booking.dto.RejectBookingRequest;
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
class AgencyBookingTest {

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void getAllBookings_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/agency/bookings"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94772000001", roles = "FARMER")
    void getAllBookings_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/agency/bookings"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getAllBookings_200() throws Exception {
        mockMvc.perform(get("/api/agency/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(4)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getPendingBookings_200() throws Exception {
        mockMvc.perform(get("/api/agency/bookings/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(5)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void approveBooking_notFound_404() throws Exception {
        mockMvc.perform(post("/api/agency/bookings/9999/approve"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(6)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void rejectBooking_missingReason_400() throws Exception {
        RejectBookingRequest req = new RejectBookingRequest();
        // reason blank
        mockMvc.perform(post("/api/agency/bookings/1/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.reason").exists());
    }

    @Test @Order(7)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void rejectBooking_notFound_404() throws Exception {
        RejectBookingRequest req = new RejectBookingRequest();
        req.setReason("Capacity issue");
        mockMvc.perform(post("/api/agency/bookings/9999/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test @Order(8)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void markPickedUp_notFound_404() throws Exception {
        mockMvc.perform(post("/api/agency/bookings/9999/pickup"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(9)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void markDelivered_notFound_404() throws Exception {
        mockMvc.perform(post("/api/agency/bookings/9999/delivered"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(10)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void markCompleted_notFound_404() throws Exception {
        mockMvc.perform(post("/api/agency/bookings/9999/complete"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(11)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getBookingsByPackage_notFound_404() throws Exception {
        mockMvc.perform(get("/api/agency/bookings/package/9999"))
                .andExpect(status().isNotFound());
    }
}

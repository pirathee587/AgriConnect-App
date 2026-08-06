package com.agriconnect.admin.revenue;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminRevenueTest {

    @Autowired MockMvc mockMvc;

    @Test @Order(1)
    void getOverview_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/overview"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(roles = "FARMER")
    void getOverview_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/overview"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(roles = "AGENT")
    void getOverview_agencyRole_403() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/overview"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(4)
    @WithMockUser(roles = "ADMIN")
    void getOverview_200() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/overview"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalRevenue").exists())
                .andExpect(jsonPath("$.totalAgencys").exists())
                .andExpect(jsonPath("$.activeAgencys").exists())
                .andExpect(jsonPath("$.totalBookings").exists())
                .andExpect(jsonPath("$.monthlyRevenue").isArray())
                .andExpect(jsonPath("$.agencyRevenue").isArray());
    }

    @Test @Order(5)
    @WithMockUser(roles = "ADMIN")
    void getOverview_containsAllFields_200() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successPayments").exists())
                .andExpect(jsonPath("$.failedPayments").exists())
                .andExpect(jsonPath("$.pendingRevenue").exists())
                .andExpect(jsonPath("$.completedBookingValue").exists())
                .andExpect(jsonPath("$.pendingApprovalAgencys").exists())
                .andExpect(jsonPath("$.suspendedAgencys").exists());
    }

    @Test @Order(6)
    @WithMockUser(roles = "ADMIN")
    void getAllPayments_200() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(7)
    @WithMockUser(roles = "ADMIN")
    void getPaymentsByStatus_success_200() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/payments/status/SUCCESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(8)
    @WithMockUser(roles = "ADMIN")
    void getPaymentsByStatus_invalid_400() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/payments/status/INVALID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("Invalid payment status")));
    }

    @Test @Order(9)
    @WithMockUser(roles = "ADMIN")
    void getPaymentsByAgency_200() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/payments/agency/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(10)
    @WithMockUser(roles = "ADMIN")
    void getPaymentsByStatus_pending_200() throws Exception {
        mockMvc.perform(get("/api/admin/revenue/payments/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

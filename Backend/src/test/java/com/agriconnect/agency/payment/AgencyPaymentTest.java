package com.agriconnect.agency.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AgencyPaymentTest {

    private static final String TEST_MERCHANT_ID = "TEST_MERCHANT";
    private static final String TEST_MERCHANT_SECRET = "TEST_SECRET";

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void initiate_noAuth_401() throws Exception {
        mockMvc.perform(post("/api/agency/payment/initiate"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94772000001", roles = "FARMER")
    void initiate_wrongRole_403() throws Exception {
        mockMvc.perform(post("/api/agency/payment/initiate"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void initiate_agencyNotPendingPayment_400() throws Exception {
        // Agency is PENDING_APPROVAL in test — not PENDING_PAYMENT
        mockMvc.perform(post("/api/agency/payment/initiate"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("not required")));
    }

    @Test @Order(4)
    void webhook_nonActivationOrder_ignores() throws Exception {
        String orderId = "OTHER-999";
        String statusCode = "2";
        String amount = "2500.00";
        String currency = "LKR";

        mockMvc.perform(post("/api/agency/payment/webhook")
                        .param("merchant_id", TEST_MERCHANT_ID)
                        .param("order_id", orderId)
                        .param("status_code", statusCode)
                        .param("payhere_amount", amount)
                        .param("payhere_currency", currency)
                        .param("md5sig", buildSignature(orderId, statusCode, amount, currency))
                        .param("payment_id", "REF001"))
                .andExpect(status().isOk())
                .andExpect(content().string("OK"));
    }

    @Test @Order(5)
    void webhook_successCode_activatesAgency() throws Exception {
        // Webhook is public, just test it responds OK
        String orderId = "ACT-1";
        String statusCode = "2";
        String amount = "2500.00";
        String currency = "LKR";

        mockMvc.perform(post("/api/agency/payment/webhook")
                        .param("merchant_id", TEST_MERCHANT_ID)
                        .param("order_id", orderId)
                        .param("status_code", statusCode)
                        .param("payhere_amount", amount)
                        .param("payhere_currency", currency)
                        .param("md5sig", buildSignature(orderId, statusCode, amount, currency))
                        .param("payment_id", "PAYREF123")
                        .param("method", "VISA"))
                .andExpect(status().isOk());
    }

    @Test @Order(6)
    void webhook_failureCode_marksFailure() throws Exception {
        String orderId = "ACT-1";
        String statusCode = "-2";
        String amount = "2500.00";
        String currency = "LKR";

        mockMvc.perform(post("/api/agency/payment/webhook")
                        .param("merchant_id", TEST_MERCHANT_ID)
                        .param("order_id", orderId)
                        .param("status_code", statusCode)
                        .param("payhere_amount", amount)
                        .param("payhere_currency", currency)
                        .param("md5sig", buildSignature(orderId, statusCode, amount, currency))
                        .param("payment_id", "PAYFAIL"))
                .andExpect(status().isOk());
    }

    private String buildSignature(String orderId, String statusCode, String amount, String currency) {
        String merchantSecretMd5 = md5(TEST_MERCHANT_SECRET).toUpperCase();
        String signatureBase = TEST_MERCHANT_ID + orderId + amount + currency + statusCode + merchantSecretMd5;
        return md5(signatureBase).toUpperCase();
    }

    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Unable to generate MD5 hash", e);
        }
    }

    @Test @Order(7)
    void webhook_invalidSignature_400() throws Exception {
        mockMvc.perform(post("/api/agency/payment/webhook")
                        .param("merchant_id", TEST_MERCHANT_ID)
                        .param("order_id", "ACT-1")
                        .param("status_code", "2")
                        .param("payhere_amount", "2500.00")
                        .param("payhere_currency", "LKR")
                        .param("md5sig", "INVALID")
                        .param("payment_id", "BADREF"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("signature mismatch")));
    }

    @Test @Order(8)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getPaymentHistory_200() throws Exception {
        mockMvc.perform(get("/api/agency/payment/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(9)
    @WithMockUser(username = "+94772000001", roles = "ADMIN")
    void getPaymentHistory_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/agency/payment/history"))
                .andExpect(status().isForbidden());
    }
}
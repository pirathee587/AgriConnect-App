package com.agriconnect.agency.payment.service;

import com.agriconnect.agency.payment.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.enums.*;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgencyPaymentService {

    private final PaymentRepository paymentRepository;
    private final AgencyRepository  agencyRepository;
    private final UserRepository    userRepository;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${payhere.api.url}")
    private String payhereUrl;

    private static final Double ACTIVATION_FEE = 2500.0;

    public AgencyPaymentInitiateResponse initiateActivationPayment(String phone) {
        User   user   = getUser(phone);
        Agency agency = getAgency(user.getId());

        if (agency.getStatus() != AgencyStatus.PENDING_PAYMENT)
            throw new IllegalArgumentException(
                    "Payment not required at this stage. Status: " + agency.getStatus());

        List<Payment> existing = paymentRepository.findByAgencyId(agency.getId());
        boolean hasPending = existing.stream()
                .anyMatch(p -> p.getStatus() == PaymentStatus.PENDING);

        Payment payment;
        if (hasPending) {
            payment = existing.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                    .findFirst().get();
        } else {
            payment = paymentRepository.save(Payment.builder()
                    .agency(agency)
                    .amount(ACTIVATION_FEE)
                    .status(PaymentStatus.PENDING)
                    .build());
        }

        return AgencyPaymentInitiateResponse.builder()
                .merchantId(merchantId)
                .orderId("ACT-" + payment.getId())
                .amount(ACTIVATION_FEE)
                .currency("LKR")
                .description("AgriConnect Agency Activation Fee")
                .agencyName(user.getName())
                .agencyPhone(user.getPhone())
                .paymentUrl(payhereUrl)
                .build();
    }

    @Transactional
    public void handleWebhook(Map<String, String> payload) {
        verifyWebhookSignature(payload);

        String orderId    = payload.get("order_id");
        String statusCode = payload.get("status_code");
        String payRef     = payload.get("payment_id");
        String method     = payload.get("method");

        log.info("PayHere webhook received: order={} status={}", orderId, statusCode);

        if (orderId == null || !orderId.startsWith("ACT-")) {
            log.warn("Unrecognized order_id: {}", orderId);
            return;
        }

        Long paymentDbId = Long.parseLong(orderId.replace("ACT-", ""));
        Payment payment = paymentRepository.findById(paymentDbId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found: " + paymentDbId));

        payment.setPaymentReference(payRef);
        payment.setPaymentMethod(method);

        switch (statusCode) {
            case "2" -> {
                payment.setStatus(PaymentStatus.SUCCESS);
                paymentRepository.save(payment);
                Agency agency = payment.getAgency();
                agency.setStatus(AgencyStatus.ACTIVE);
                agency.setActivatedAt(LocalDateTime.now());
                agencyRepository.save(agency);
                log.info("Agency {} activated after payment {}", agency.getId(), payRef);
            }
            case "0" -> {
                payment.setStatus(PaymentStatus.PENDING);
                paymentRepository.save(payment);
                log.info("Payment {} is pending", payRef);
            }
            case "-1" -> {
                payment.setStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
            }
            default -> {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Payment declined. Code: " + statusCode);
                paymentRepository.save(payment);
                log.warn("Payment {} failed with code {}", payRef, statusCode);
            }
        }
    }

    public List<AgencyPaymentHistoryResponse> getMyPayments(String phone) {
        User   user   = getUser(phone);
        Agency agency = getAgency(user.getId());

        return paymentRepository
                .findByAgencyIdOrderByCreatedAtDesc(agency.getId())
                .stream().map(p ->
                        AgencyPaymentHistoryResponse.builder()
                                .paymentId(p.getId())
                                .amount(p.getAmount())
                                .currency("LKR")
                                .paymentReference(p.getPaymentReference())
                                .paymentMethod(p.getPaymentMethod())
                                .status(p.getStatus().name())
                                .failureReason(p.getFailureReason())
                                .createdAt(p.getCreatedAt())
                                .build())
                .collect(Collectors.toList());
    }

    private User getUser(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Agency getAgency(Long userId) {
        return agencyRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Agency profile not found"));
    }

    private void verifyWebhookSignature(Map<String, String> payload) {
        String incomingSignature  = payload.get("md5sig");
        String incomingMerchantId = payload.get("merchant_id");
        String orderId            = payload.get("order_id");
        String amount             = payload.get("payhere_amount");
        String currency           = payload.get("payhere_currency");
        String statusCode         = payload.get("status_code");

        if (isBlank(incomingSignature) || isBlank(incomingMerchantId)
                || isBlank(orderId) || isBlank(amount)
                || isBlank(currency) || isBlank(statusCode))
            throw new IllegalArgumentException("Invalid PayHere webhook payload: missing signature fields");

        if (!merchantId.equals(incomingMerchantId))
            throw new IllegalArgumentException("Invalid PayHere webhook payload: merchant mismatch");

        String localSecretHash = md5Hex(merchantSecret).toUpperCase();
        String expectedSignature = md5Hex(
                incomingMerchantId + orderId + amount + currency + statusCode + localSecretHash
        ).toUpperCase();

        if (!expectedSignature.equalsIgnoreCase(incomingSignature))
            throw new IllegalArgumentException("Invalid PayHere webhook payload: signature mismatch");
    }

    private boolean isBlank(String value) { return value == null || value.isBlank(); }

    private String md5Hex(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 algorithm not available", e);
        }
    }
}

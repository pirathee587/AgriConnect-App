package com.agriconnect.shared.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecretConfigValidator {

    private final Environment environment;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${payhere.merchant.id:}")
    private String payhereMerchantId;

    @Value("${payhere.merchant.secret:}")
    private String payhereMerchantSecret;

    @PostConstruct
    public void validateSecrets() {
        // Tests use isolated fixtures and can keep lightweight test-only secrets.
        if (environment.acceptsProfiles(Profiles.of("test"))) {
            return;
        }

        requireNonBlank(jwtSecret, "JWT_SECRET / jwt.secret");
        requireNonBlank(payhereMerchantId, "PAYHERE_MERCHANT_ID / payhere.merchant.id");
        requireNonBlank(payhereMerchantSecret, "PAYHERE_MERCHANT_SECRET / payhere.merchant.secret");

        log.info("Security secret validation completed successfully.");
    }

    private void requireNonBlank(String value, String keyName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Missing required secret configuration: " + keyName +
                            ". Set it via environment variables before startup.");
        }
    }
}

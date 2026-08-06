package com.agriconnect.shared.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtp(String toEmail, String otp, String name) {
        try {
            log.info("Sending OTP email to recipient domain: {}", extractDomain(toEmail));
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("AgriConnect <" + fromEmail + ">");
            message.setTo(toEmail);
            message.setSubject("AgriConnect - Your OTP Code");
            message.setText(
                "Hello " + name + ",\n\n" +
                "Your AgriConnect verification code is:\n\n" +
                "    " + otp + "\n\n" +
                "This code expires in 5 minutes.\n" +
                "Do not share this code with anyone.\n\n" +
                "AgriConnect Team"
            );
            mailSender.send(message);
            log.info("OTP email sent successfully to recipient domain: {}", extractDomain(toEmail));
        } catch (Exception e) {
            log.warn("Failed to send OTP email to recipient domain: {}", extractDomain(toEmail));
        }
    }

    private String extractDomain(String email) {
        if (email == null) return "unknown";
        int atIndex = email.indexOf('@');
        return atIndex >= 0 && atIndex + 1 < email.length() ? email.substring(atIndex + 1) : "unknown";
    }
}


package com.agriconnect;

import com.agriconnect.admin.auth.service.AdminAuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@Slf4j
public class AgriconnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(AgriconnectApplication.class, args);
	}

	@Bean
	CommandLineRunner initAdmin(
			AdminAuthService adminAuthService,
			@Value("${app.bootstrap.default-admin.enabled:true}") boolean bootstrapEnabled,
			@Value("${app.bootstrap.default-admin.name:Default Admin}") String adminName,
			@Value("${app.bootstrap.default-admin.phone:admin}") String adminPhone,
			@Value("${app.bootstrap.default-admin.password:admin123}") String adminPassword,
			@Value("${app.bootstrap.default-admin.email:admin@agriconnect.local}") String adminEmail
	) {
		return args -> {
			if (!bootstrapEnabled) {
				log.info("Default admin bootstrap is disabled.");
				return;
			}

			try {
				adminAuthService.createAdmin(adminName, adminPhone, adminPassword, adminEmail);
				log.info("Default admin bootstrap completed.");
			} catch (Exception e) {
				log.info("Default admin bootstrap skipped: {}", e.getMessage());
			}
		};
	}

}

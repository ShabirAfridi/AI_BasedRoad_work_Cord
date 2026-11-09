package com.UNI_FYP.AI_Based_Road_Construction.config;

import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.UserRole;
import com.UNI_FYP.AI_Based_Road_Construction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;



    @Value("${admin.seed.email}")
    private String adminEmail;
    @Value("${admin.seed.password}")
    private String adminPassword;
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.existsByEmail(adminEmail)){
            log.info("admin seed skipped - an account already exist for {}",adminEmail);
            return;
        }
        User admin = User.builder()
                .fullName("System Administrator ")
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(UserRole.ADMIN)
                .department(null)
                .enabled(true)
                .build();
        userRepository.save(admin);
        log.info("Seeded default admin account: {}", adminEmail);
        log.warn("Log in and change the admin password — the seed value should not stay in use long-term.");

    }
}

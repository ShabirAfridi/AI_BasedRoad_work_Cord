package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.AuthRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.AuthResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.GoogleAuthRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.RegisterRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.Department;
import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.UserRole;
import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import com.UNI_FYP.AI_Based_Road_Construction.repository.DepartmentRepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.UserRepository;
import com.UNI_FYP.AI_Based_Road_Construction.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    @Value("${google.oauth.client-id}")
    private String googleClientId;

    private final UserRepository        userRepository;
    private final DepartmentRepository  departmentRepository;
    private final JwtService            jwtService;
    private final PasswordEncoder       passwordEncoder;

    @Lazy
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already registered: ", HttpStatus.CONFLICT);
        }
        UserRole requestedRole = request.getRole()!= null ?request.getRole(): UserRole.CITIZEN;
        Department department = null;
        requestedRole = request.getRole() != null ? request.getRole() : UserRole.CITIZEN;


        if (requestedRole == UserRole.ADMIN) {
            throw new AppException("Admin accounts cannot be created through registration", HttpStatus.FORBIDDEN);
        }

        if (requestedRole == UserRole.DEPARTMENT_USER) {
            if (request.getDepartmentId() == null) {
                throw new AppException("Department ID is required for department users", HttpStatus.BAD_REQUEST);
            }
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new AppException(
                            "Department not found with id: ", HttpStatus.NOT_FOUND));
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(requestedRole)
                .department(department)
                .enabled(true)
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return buildAuthResponse(token, user);
    }

    public AuthResponse login(AuthRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found",HttpStatus.NOT_FOUND));

        String token = jwtService.generateToken(user);
        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .departmentId(user.getDepartment() != null
                        ? user.getDepartment().getId()
                        : null)
                .build();
    }
    public AuthResponse googleLogin(GoogleAuthRequest request) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
        GoogleIdToken idToken = verifier.verify(request.idToken());
        if (idToken == null) {
            throw new AppException("Invalid google token",HttpStatus.UNAUTHORIZED);
        }
        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String fullName = (String) payload.get("name");

        User user = userRepository.findByEmail(email)
                .orElseGet(()->{
                    User newUser = User.builder()
                            .fullName(fullName!= null?fullName : email)
                            .email(email)
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().
                                    toString()))
                            .role(UserRole.CITIZEN)
                            .department(null)
                            .enabled(true)
                            .build();
                            return userRepository.save(newUser);
                });
        if (!user.isEnabled()){
            throw new AppException("This account has been disabled",HttpStatus.FORBIDDEN);
        }
        String token = jwtService.generateToken(user);
        return buildAuthResponse(token,user);
    }
}
package com.jobmarket.service;

import com.jobmarket.dto.auth.*;
import com.jobmarket.entity.User;
import com.jobmarket.repository.UserRepository;
import com.jobmarket.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final Duration REFRESH_TTL = Duration.ofDays(7);

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(User.Role.USER)
                .isActive(true)
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();
        String email = jwtService.extractUsername(token);

        String stored = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + email);
        if (stored == null || !stored.equals(token)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!jwtService.isTokenValid(token, user)) {
            throw new IllegalArgumentException("Refresh token is no longer valid");
        }

        return buildAuthResponse(user);
    }

    public void logout(RefreshRequest request) {
        String email = jwtService.extractUsername(request.refreshToken());
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + email);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + user.getEmail(),
                refreshToken,
                REFRESH_TTL);

        return AuthResponse.of(accessToken, refreshToken, 900L,
                               user.getEmail(), user.getRole().name());
    }
}

package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.authentication.RefreshTokenRotation;
import com.project.fitness_nutrition_plan.core.exception.AppObjectUnauthorizedException;
import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationResponseDto;
import com.project.fitness_nutrition_plan.model.RefreshToken;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setToken(generateRandomToken());
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshExpiration));
        refreshToken.setRevoked(false);

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);

        return savedToken.getToken();
    }

    public RefreshTokenRotation rotateRefreshToken(String token) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AppObjectUnauthorizedException(
                        "REFRESH_TOKEN",
                        "Invalid refresh token"
                ));

        if (storedToken.isRevoked()) {
            throw new AppObjectUnauthorizedException(
                    "REFRESH_TOKEN",
                    "Refresh token has already been used"
            );
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppObjectUnauthorizedException(
                    "REFRESH_TOKEN",
                    "Refresh token has expired"
            );
        }

        User user = storedToken.getUser();

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newRefreshToken = createRefreshToken(user);

        return new RefreshTokenRotation(user, newRefreshToken);
    }

    public void revokeRefreshToken(String token) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AppObjectUnauthorizedException(
                        "REFRESH_TOKEN",
                        "Invalid refresh token"
                ));

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);
    }

    private String generateRandomToken() {
        byte[] randomBytes = new byte[64];
        SECURE_RANDOM.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }
}

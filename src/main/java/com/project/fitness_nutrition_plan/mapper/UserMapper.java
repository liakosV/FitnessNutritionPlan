package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.user.ChangePasswordDto;
import com.project.fitness_nutrition_plan.dto.user.UserInsertDto;
import com.project.fitness_nutrition_plan.dto.user.UserReadDto;
import com.project.fitness_nutrition_plan.dto.user.UserUpdateDto;
import com.project.fitness_nutrition_plan.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Component responsible for mapping between the User entity and its DTO representations.
 */
@Component
@RequiredArgsConstructor
public class UserMapper {

    private final PasswordEncoder passwordEncoder;

    /**
     * Maps a User entity to a UserReadDto object.
     *
     * @param user the User entity to be mapped
     * @return the mapped UserReadDto object containing user data
     */
    public UserReadDto mapToUserReadDto(User user) {
        var dto = new UserReadDto();

        dto.setId(user.getId());
        dto.setUuid(user.getUuid());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());

        return dto;
    }

    /**
     * Maps a UserInsertDto object to a User entity.
     * The method transfers data from the UserInsertDto to a new User object
     * and encodes the provided password.
     *
     * @param dto the UserInsertDto object containing user details such as username, email, and password
     * @return a new User entity populated with the data from the provided DTO
     */
    public User mapToUserEntity(UserInsertDto dto) {
        User user = new User();

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        return user;
    }

    /**
     * Updates the provided User entity with data from the given UserUpdateDto object.
     * Only non-null fields from the DTO are used to update the User entity.
     *
     * @param user the User entity to be updated
     * @param dto  the UserUpdateDto containing the updated user data
     */
    public void updateUserFromDto(User user, UserUpdateDto dto) {

        if (dto.getUsername() != null) {
            user.setUsername(dto.getUsername());
        }

        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
    }
}

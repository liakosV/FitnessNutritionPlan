package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.core.exception.AppObjectAlreadyExistsException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectIllegalStateException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectNotFoundException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectUnauthorizedException;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.dto.user.ChangePasswordDto;
import com.project.fitness_nutrition_plan.dto.user.UserInsertDto;
import com.project.fitness_nutrition_plan.dto.user.UserReadDto;
import com.project.fitness_nutrition_plan.dto.user.UserUpdateDto;
import com.project.fitness_nutrition_plan.mapper.UserMapper;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.static_data.Role;
import com.project.fitness_nutrition_plan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class responsible for managing user-related operations.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;


    /**
     * Saves a new user using the provided data transfer object.
     * Validates the uniqueness of the username and email before persisting the user.
     *
     * @param insertDto the data transfer object containing the user's registration information
     * @return the data transfer object representing the saved user
     * @throws AppObjectAlreadyExistsException if the username or email already exists
     */
    @Transactional
    public UserReadDto saveUser(UserInsertDto insertDto) {
        if(userRepository.existsByUsername(insertDto.getUsername())) {
            throw new AppObjectAlreadyExistsException("USER", "Username already exists");
        }
        if (userRepository.existsByEmail(insertDto.getEmail())) {
            throw new AppObjectAlreadyExistsException("USER", "Email already exists");
        }

        User user = userMapper.mapToUserEntity(insertDto);
        user.setRole(Role.ROLE_USER);

        User savedUser = userRepository.save(user);

        return userMapper.mapToUserReadDto(savedUser);
    }

    /**
     * Updates an existing user based on the provided UserUpdateDto and UUID.
     * Ensures that the updated username or email is unique and throws exceptions if constraints are violated.
     *
     * @param updateDto the UserUpdateDto containing updated user details
     * @param uuid the unique identifier of the user to be updated
     * @return a UserReadDto representing the updated user
     * @throws AppObjectNotFoundException if the user with the given UUID is not found
     * @throws AppObjectAlreadyExistsException if the updated username or email already exists
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #uuid")
    @Transactional
    public UserReadDto updateUser(UserUpdateDto updateDto, String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));

        if (updateDto.getUsername() != null &&
        !user.getUsername().equals(updateDto.getUsername()) &&
        userRepository.existsByUsername(updateDto.getUsername())) {
            throw new AppObjectAlreadyExistsException("USER", "Username already exists");
        }

        if (updateDto.getEmail() != null &&
        !user.getEmail().equals(updateDto.getEmail()) &&
        userRepository.existsByEmail(updateDto.getEmail())) {
            throw new AppObjectAlreadyExistsException("USER", "Email already exists");
        }

        userMapper.updateUserFromDto(user, updateDto);
        return userMapper.mapToUserReadDto(user);
    }

    /**
     * Retrieves a user by their unique UUID.
     *
     * @param uuid the unique identifier of the user
     * @return the UserReadDto representing the user's data
     * @throws AppObjectNotFoundException if no user with the given UUID is found
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH') or principal.uuid == #uuid")
    @Transactional(readOnly = true)
    public UserReadDto getUserByUuid(String uuid) {
        return userRepository.findByUuid(uuid)
                .map(userMapper::mapToUserReadDto)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));
    }

    /**
     * Retrieves a list of all users from the repository and maps them to UserReadDto objects.
     *
     * @return a list of UserReadDto instances representing all users
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    @Transactional(readOnly = true)
    public List<UserReadDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::mapToUserReadDto)
                .toList();
    }

    @PreAuthorize("isAuthenticated() and principal.uuid == #currentUserUuid")
    @Transactional(readOnly = true)
    public List<UserReadDto> getMessageRecipients(String currentUserUuid) {
        return userRepository.findByUuidNotOrderByUsernameAsc(currentUserUuid).stream()
                .map(userMapper::mapToUserReadDto)
                .toList();
    }

    /**
     * Deletes a user by their unique identifier (UUID).
     *
     * @param uuid the unique identifier of the user to be deleted
     * @return a ResponseMessageDto containing the status code and message of the deletion operation
     * @throws AppObjectNotFoundException if the user with the specified UUID is not found
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    public ResponseMessageDto deleteUser(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));

        userRepository.delete(user);

        return new ResponseMessageDto("USER_DELETED", "User deleted successfully");
    }

    /**
     * Updates the password of an existing user if the provided old password matches
     * and the new password is different from the old one.
     *
     * @param uuid the unique identifier of the user whose password is to be changed
     * @param changePasswordDto a DTO containing the old password and the new password
     * @return a UserReadDto containing the updated user data
     * @throws AppObjectNotFoundException if no user with the specified UUID is found
     * @throws AppObjectUnauthorizedException if the old password provided is incorrect
     * @throws AppObjectIllegalStateException if the new password is the same as the old password
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #uuid")
    @Transactional
    public UserReadDto changePassword(String uuid, ChangePasswordDto changePasswordDto) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));

        if (!passwordEncoder.matches(changePasswordDto.getOldPassword(), user.getPassword())) {

            throw new AppObjectUnauthorizedException("PASSWORD", "Old password is incorrect");
        }

        if (passwordEncoder.matches(changePasswordDto.getNewPassword(), user.getPassword())) {

            throw new AppObjectIllegalStateException("PASSWORD", "New password cannot be the same as old password");
        }

        user.setPassword(passwordEncoder.encode(changePasswordDto.getNewPassword()));
        return userMapper.mapToUserReadDto(user);
    }

    /**
     * Changes the role of a user identified by their unique UUID.
     * Throws exceptions if the user is not found or already has the specified role.
     *
     * @param uuid the unique identifier of the user whose role is to be changed
     * @param role the new role to be assigned to the user
     * @return a UserReadDto representing the updated user with the new role
     * @throws AppObjectNotFoundException if the user with the given UUID is not found
     * @throws AppObjectIllegalStateException if the user already has the specified role
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    public UserReadDto changeUserRole(String uuid, Role role) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));

        if (user.getRole().equals(role)) {
            throw new AppObjectIllegalStateException("USER_ROLE", "User already has this role");
        }

        user.setRole(role);
        return userMapper.mapToUserReadDto(user);
    }
}

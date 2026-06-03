package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.dto.user.ChangePasswordDto;
import com.project.fitness_nutrition_plan.dto.user.UserReadDto;
import com.project.fitness_nutrition_plan.dto.user.UserUpdateDto;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.static_data.Role;
import com.project.fitness_nutrition_plan.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserRestController {

    private final UserService userService;

    @GetMapping("/{uuid}")
    public ResponseEntity<UserReadDto> getUserByUuid(@PathVariable String uuid) {
        return ResponseEntity.ok(userService.getUserByUuid(uuid));
    }

    @GetMapping
    public ResponseEntity<List<UserReadDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/me")
    public ResponseEntity<UserReadDto> updateUser(
            @AuthenticationPrincipal User loggedInUser,
            @Valid @RequestBody UserUpdateDto updateDto) {

        UserReadDto userReadDto = userService.updateUser(updateDto, loggedInUser.getUuid());

        return ResponseEntity.ok(userReadDto);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ResponseMessageDto> deleteUser(@PathVariable String uuid) {
        return ResponseEntity.ok(userService.deleteUser(uuid));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<UserReadDto> changePassword(
            @AuthenticationPrincipal User loggedInUser,
            @RequestBody ChangePasswordDto dto) {

        UserReadDto userReadDto = userService.changePassword(loggedInUser.getUuid(), dto);

        return ResponseEntity.ok(userReadDto);
    }

    @PatchMapping("/{uuid}/role")
    public ResponseEntity<UserReadDto> changeUserRole(
            @PathVariable String uuid,
            @Valid @RequestBody Role role) {

        UserReadDto userReadDto = userService.changeUserRole(uuid, role);

        return ResponseEntity.ok(userReadDto);
    }


}

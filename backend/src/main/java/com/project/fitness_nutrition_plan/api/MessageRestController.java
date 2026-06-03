package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.dto.message.MessageInsertDto;
import com.project.fitness_nutrition_plan.dto.message.MessageReadDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.service.MessagesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageRestController {

    private final MessagesService messagesService;

    @PostMapping
    public ResponseEntity<MessageReadDto> sendMessage(
            @RequestBody @Valid MessageInsertDto insertDto,
            @AuthenticationPrincipal User loggedInUser) {

        MessageReadDto messageReadDto = messagesService.sendMessage(insertDto, loggedInUser.getUuid());

        return ResponseEntity.ok(messageReadDto);
    }

    @GetMapping("/{messageUuid}")
    public ResponseEntity<MessageReadDto> getMessageByUuid(
            @PathVariable String messageUuid,
            @AuthenticationPrincipal User loggedInUser) {

        return ResponseEntity.ok(messagesService.getMessageByUuid(messageUuid, loggedInUser.getUuid()));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MessageReadDto>> getSentMessages(@AuthenticationPrincipal User loggedInUser) {
        return ResponseEntity.ok(messagesService.getSentMessages(loggedInUser.getUuid()));
    }

    @GetMapping("/received")
    public ResponseEntity<List<MessageReadDto>> getReceivedMessages(@AuthenticationPrincipal User loggedInUser) {
        return ResponseEntity.ok(messagesService.getReceivedMessages(loggedInUser.getUuid()));
    }

    @GetMapping("/conversation/{otherUserUuid}")
    public ResponseEntity<List<MessageReadDto>> getConversation(
            @PathVariable String otherUserUuid,
            @AuthenticationPrincipal User loggedInUser) {

        return ResponseEntity.ok(messagesService.getConversation(loggedInUser.getUuid(), otherUserUuid));
    }

    @DeleteMapping("/{messageUuid}")
    public ResponseEntity<ResponseMessageDto> deleteMessage(
            @PathVariable String messageUuid,
            @AuthenticationPrincipal User loggedInUser) {

        return ResponseEntity.ok(messagesService.deleteMessage(messageUuid, loggedInUser.getUuid()));
    }
}

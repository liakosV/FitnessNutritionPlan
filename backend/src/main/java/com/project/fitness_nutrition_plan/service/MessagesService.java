package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.core.exception.AppObjectAccessDeniedException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectInvalidArgumentException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectNotFoundException;
import com.project.fitness_nutrition_plan.dto.message.MessageInsertDto;
import com.project.fitness_nutrition_plan.dto.message.MessageReadDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.mapper.MessageMapper;
import com.project.fitness_nutrition_plan.model.Message;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.static_data.Role;
import com.project.fitness_nutrition_plan.repository.MessageRepository;
import com.project.fitness_nutrition_plan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * The MessagesService class is responsible for handling messaging-related operations,
 * including sending messages, fetching messages, retrieving conversations, and deleting messages.
 */
@Service
@RequiredArgsConstructor
public class MessagesService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;

    /**
     * Sends a message from the sender to the receiver specified in the given MessageInsertDto.
     *
     * @param insertDto the DTO containing the message content and the receiver's UUID
     * @param senderUuid the UUID of the user sending the message
     * @return a MessageReadDto containing the details of the sent message
     * @throws AppObjectInvalidArgumentException if the sender and receiver UUIDs are the same
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #senderUuid")
    @Transactional
    public MessageReadDto sendMessage(MessageInsertDto insertDto, String senderUuid) {
        if (senderUuid.equals(insertDto.getReceiverUuid())) {
            throw new AppObjectInvalidArgumentException("MESSAGE", "Sender and receiver cannot be the same user");
        }

        User sender = getUserByUuid(senderUuid);
        User receiver = getUserByUuid(insertDto.getReceiverUuid());

        Message message = messageMapper.mapToMessageEntity(insertDto, sender, receiver);
        Message savedMessage = messageRepository.save(message);

        return messageMapper.mapToMessageReadDto(savedMessage);
    }

    /**
     * Retrieves a message by its unique identifier and validates the user's participation.
     *
     * @param messageUuid the unique identifier of the message to retrieve
     * @param currentUserUuid the unique identifier of the current user attempting to access the message
     * @return a MessageReadDto object containing the details of the retrieved message
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #currentUserUuid")
    @Transactional(readOnly = true)
    public MessageReadDto getMessageByUuid(String messageUuid, String currentUserUuid) {
        Message message = getMessageByUuid(messageUuid);
        validateParticipant(message, currentUserUuid);

        return messageMapper.mapToMessageReadDto(message);
    }

    /**
     * Retrieves a list of messages sent by a specific user, identified by their UUID.
     * The messages are ordered by timestamp in descending order.
     *
     * @param senderUuid the UUID of the user whose sent messages are to be retrieved
     * @return a list of MessageReadDto objects representing the sent messages
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #senderUuid")
    @Transactional(readOnly = true)
    public List<MessageReadDto> getSentMessages(String senderUuid) {
        getUserByUuid(senderUuid);

        return messageRepository.findBySenderUuidOrderByTimeStampDesc(senderUuid)
                .stream()
                .map(messageMapper::mapToMessageReadDto)
                .toList();
    }

    /**
     * Retrieves a list of messages received by the specified user, ordered by timestamp in descending order.
     *
     * @param receiverUuid the unique identifier of the user who received the messages
     * @return a list of MessageReadDto objects representing the received messages
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #receiverUuid")
    @Transactional(readOnly = true)
    public List<MessageReadDto> getReceivedMessages(String receiverUuid) {
        getUserByUuid(receiverUuid);

        return messageRepository.findByReceiverUuidOrderByTimeStampDesc(receiverUuid)
                .stream()
                .map(messageMapper::mapToMessageReadDto)
                .toList();
    }

    /**
     * Retrieves the conversation between two users, identified by their UUIDs,
     * in chronological order of messages. Ensures that the conversation is only
     * fetched for two distinct users.
     *
     * @param currentUserUuid the UUID of the user initiating the request
     * @param otherUserUuid the UUID of the second user involved in the conversation
     * @return a list of MessageReadDto objects representing the messages in the conversation
     * @throws AppObjectInvalidArgumentException if the provided UUIDs refer to the same user
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #currentUserUuid")
    @Transactional(readOnly = true)
    public List<MessageReadDto> getConversation(String currentUserUuid, String otherUserUuid) {
        if (currentUserUuid.equals(otherUserUuid)) {
            throw new AppObjectInvalidArgumentException("MESSAGE", "Conversation requires two different users");
        }

        getUserByUuid(currentUserUuid);
        getUserByUuid(otherUserUuid);

        return messageRepository.findConversationBetweenUsers(currentUserUuid, otherUserUuid)
                .stream()
                .map(messageMapper::mapToMessageReadDto)
                .toList();
    }

    /**
     * Deletes a message identified by its UUID, ensuring that the current user is a participant
     * in the conversation. Removes the message from the repository.
     *
     * @param messageUuid the unique identifier of the message to be deleted
     * @param currentUserUuid the unique identifier of the user attempting to delete the message
     * @return a ResponseMessageDto containing the status code and confirmation message
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #currentUserUuid")
    @Transactional
    public ResponseMessageDto deleteMessage(String messageUuid, String currentUserUuid) {
        Message message = getMessageByUuid(messageUuid);
        validateParticipant(message, currentUserUuid);

        messageRepository.delete(message);

        return new ResponseMessageDto("MESSAGE_DELETED", "Message deleted successfully");
    }

    /**
     * Retrieves a user by their unique identifier (UUID).
     *
     * @param userUuid the unique identifier of the user to be retrieved
     * @return the User object corresponding to the given UUID
     * @throws AppObjectNotFoundException if no user is found with the provided UUID
     */
    private User getUserByUuid(String userUuid) {
        return userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));
    }

    /**
     * Retrieves a message by its unique identifier (UUID).
     *
     * @param messageUuid the unique identifier of the message to retrieve
     * @return the retrieved {@code Message} instance
     * @throws AppObjectNotFoundException if no message with the specified UUID is found
     */
    private Message getMessageByUuid(String messageUuid) {
        return messageRepository.findByUuid(messageUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("MESSAGE", "Message not found"));
    }

    /**
     * Validates whether the current user is either the sender or the receiver of the provided message.
     * Throws an exception if the user does not have access to the message.
     *
     * @param message the message to validate
     * @param currentUserUuid the UUID of the current user
     * @throws AppObjectAccessDeniedException if the user is neither the sender nor the receiver of the message
     */
    private void validateParticipant(Message message, String currentUserUuid) {
        if (isAdmin(currentUserUuid)) {
            return;
        }

        boolean isSender = message.getSender().getUuid().equals(currentUserUuid);
        boolean isReceiver = message.getReceiver().getUuid().equals(currentUserUuid);

        if (!isSender && !isReceiver) {
            throw new AppObjectAccessDeniedException("MESSAGE", "You do not have access to this message");
        }
    }

    private boolean isAdmin(String userUuid) {
        return userRepository.findByUuid(userUuid)
                .map(user -> user.getRole() == Role.ROLE_ADMIN)
                .orElse(false);
    }
}

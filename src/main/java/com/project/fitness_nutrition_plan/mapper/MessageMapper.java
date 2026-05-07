package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.message.MessageReadDto;
import com.project.fitness_nutrition_plan.model.Message;
import com.project.fitness_nutrition_plan.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Component responsible for mapping between Message entity and MessageReadDto.
 */
@Component
public class MessageMapper {

    /**
     * Maps a Message entity to a MessageReadDto.
     *
     * @param message the Message entity to be mapped
     * @return a MessageReadDto containing data from the provided Message entity
     */
    public MessageReadDto mapToMessageReadDto(Message message) {
        var dto = new MessageReadDto();

        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimeStamp());

        dto.setSenderId(message.getSender().getId());
        dto.setSenderUsername(message.getSender().getUsername());

        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverUsername(message.getReceiver().getUsername());

        return dto;
    }

    /**
     * Maps a MessageReadDto object to a Message entity by transferring its data and associating a sender and receiver.
     *
     * @param dto the MessageReadDto object containing the message content to be mapped
     * @param sender the User entity representing the sender of the message
     * @param receiver the User entity representing the receiver of the message
     * @return a new Message entity populated with the data from the provided DTO and associated users
     */
    public Message mapToMessageEntity(MessageReadDto dto, User sender, User receiver) {
        Message message = new Message();

        message.setContent(dto.getContent());
        message.setTimeStamp(LocalDateTime.now());

        message.setSender(sender);
        message.setReceiver(receiver);

        return message;
    }
}

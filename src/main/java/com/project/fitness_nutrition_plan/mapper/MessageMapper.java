package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.message.MessageInsertDto;
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
        dto.setUuid(message.getUuid());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimeStamp());

        dto.setSenderUuid(message.getSender().getUuid());
        dto.setSenderUsername(message.getSender().getUsername());

        dto.setReceiverUuid(message.getReceiver().getUuid());
        dto.setReceiverUsername(message.getReceiver().getUsername());

        return dto;
    }

    /**
     * Maps a MessageInsertDto object, along with sender and receiver User entities, to a Message entity.
     *
     * @param dto the MessageInsertDto containing details like content and receiver ID
     * @param sender the User entity representing the sender of the message
     * @param receiver the User entity representing the receiver of the message
     * @return a new Message entity populated with the data from the provided DTO, sender, and receiver
     */
    public Message mapToMessageEntity(MessageInsertDto dto, User sender, User receiver) {
        Message message = new Message();

        message.setContent(dto.getContent());
        message.setTimeStamp(LocalDateTime.now());

        message.setSender(sender);
        message.setReceiver(receiver);

        return message;
    }
}

package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderId(Long senderId);

    List<Message> findByReceiverId(Long receiverId);

    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(
            Long senderId,
            Long receiverId,
            Long receiverId2,
            Long senderId2
    );
}

package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Optional<Message> findByUuid(String uuid);

    List<Message> findBySenderUuidOrderByTimeStampDesc(String senderUuid);

    List<Message> findByReceiverUuidOrderByTimeStampDesc(String receiverUuid);

    @Query("""
            select m from Message m
            where (m.sender.uuid = :firstUserUuid and m.receiver.uuid = :secondUserUuid)
               or (m.sender.uuid = :secondUserUuid and m.receiver.uuid = :firstUserUuid)
            order by m.timeStamp asc
            """)
    List<Message> findConversationBetweenUsers(
            @Param("firstUserUuid") String firstUserUuid,
            @Param("secondUserUuid") String secondUserUuid
    );
}

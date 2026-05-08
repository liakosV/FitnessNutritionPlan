package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.progress_entry.ProgressEntryInsertDto;
import com.project.fitness_nutrition_plan.dto.progress_entry.ProgressEntryReadDto;
import com.project.fitness_nutrition_plan.model.ProgressEntry;
import com.project.fitness_nutrition_plan.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Component responsible for mapping between ProgressEntry entity and ProgressEntryReadDto.
 */
@Component
public class ProgressEntryMapper {

    /**
     * Maps a ProgressEntry entity to a ProgressEntryReadDto object.
     *
     * @param progressEntry the ProgressEntry entity to be mapped
     * @return a ProgressEntryReadDto containing data from the provided ProgressEntry entity
     */
    public ProgressEntryReadDto mapToProgressEntryReadDto(ProgressEntry progressEntry) {
        var dto = new ProgressEntryReadDto();

        dto.setId(progressEntry.getId());
        dto.setWeight(progressEntry.getWeight());
        dto.setBodyFat(progressEntry.getBodyFat());
        dto.setNotes(progressEntry.getNotes());
        dto.setDate(progressEntry.getDate());

        dto.setUserId(progressEntry.getUser().getId());
        dto.setUsername(progressEntry.getUser().getUsername());

        return dto;
    }

    /**
     * Maps a ProgressEntryInsertDto object and a User entity to a new ProgressEntry entity.
     * The method transfers data from the DTO and associates the provided User with the ProgressEntry.
     *
     * @param dto the ProgressEntryInsertDto containing progress entry details such as weight, body fat, and notes
     * @param user the User entity to be associated with the mapped ProgressEntry
     * @return a new ProgressEntry entity populated with data from the provided DTO and associated User
     */
    public ProgressEntry mapToProgressEntry(ProgressEntryInsertDto dto, User user) {
        ProgressEntry progressEntry = new ProgressEntry();

        progressEntry.setWeight(dto.getWeight());
        progressEntry.setBodyFat(dto.getBodyFat());
        progressEntry.setNotes(dto.getNotes());

        progressEntry.setDate(LocalDate.now());

        progressEntry.setUser(user);

        return progressEntry;
    }
}

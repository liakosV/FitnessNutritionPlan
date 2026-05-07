package com.project.fitness_nutrition_plan.mapper;

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
     * Maps a ProgressEntryReadDto and a User entity to a ProgressEntry entity.
     *
     * @param dto the ProgressEntryReadDto containing weight, body fat, and notes data
     * @param user the User entity associated with the progress entry
     * @return a ProgressEntry entity populated with data from the provided DTO and associated user
     */
    public ProgressEntry mapToProgressEntry(ProgressEntryReadDto dto, User user) {
        ProgressEntry progressEntry = new ProgressEntry();

        progressEntry.setWeight(dto.getWeight());
        progressEntry.setBodyFat(dto.getBodyFat());
        progressEntry.setNotes(dto.getNotes());

        progressEntry.setDate(LocalDate.now());

        progressEntry.setUser(user);

        return progressEntry;
    }
}

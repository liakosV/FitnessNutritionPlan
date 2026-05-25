package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.core.exception.AppObjectNotFoundException;
import com.project.fitness_nutrition_plan.dto.progress_entry.ProgressEntryInsertDto;
import com.project.fitness_nutrition_plan.dto.progress_entry.ProgressEntryReadDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.mapper.ProgressEntryMapper;
import com.project.fitness_nutrition_plan.model.ProgressEntry;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.repository.ProgressEntryRepository;
import com.project.fitness_nutrition_plan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class responsible for managing operations related to ProgressEntry entities.
 */
@Service
@RequiredArgsConstructor
public class ProgressEntryService {

    private final ProgressEntryMapper progressEntryMapper;
    private final ProgressEntryRepository progressEntryRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new progress entry for a specific user based on the provided data.
     * The method performs the mapping from the input DTO to a ProgressEntry entity,
     * associates it with the corresponding user, saves it to the repository,
     * and returns a DTO representation of the saved entity.
     *
     * @param insertDto the DTO containing details of the progress entry to be created
     * @param userUuid the UUID of the user for whom the progress entry is being created
     * @return a DTO containing details of the newly created progress entry
     * @throws AppObjectNotFoundException if the user with the given UUID is not found
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH') or principal.uuid == #userUuid")
    @Transactional
    public ProgressEntryReadDto createProgressEntry(ProgressEntryInsertDto insertDto, String userUuid) {
        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));

        ProgressEntry progressEntry = progressEntryMapper.mapToProgressEntry(insertDto, user);

        ProgressEntry savedProgressEntry = progressEntryRepository.save(progressEntry);

        return progressEntryMapper.mapToProgressEntryReadDto(savedProgressEntry);
    }

    /**
     * Retrieves a list of progress entries for a user specified by their unique identifier (UUID),
     * sorted in descending order by date.
     *
     * @param uuid the unique identifier of the user whose progress entries are to be retrieved
     * @return a list of ProgressEntryReadDto objects representing the progress entries of the specified user
     * @throws AppObjectNotFoundException if the user with the given UUID is not found
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH') or principal.uuid == #uuid")
    @Transactional(readOnly = true)
    public List<ProgressEntryReadDto> getProgressEntriesByUserUuid(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));

        return progressEntryRepository.findByUserOrderByDateDesc(user)
                .stream().map(progressEntryMapper::mapToProgressEntryReadDto)
                .toList();
    }

    /**
     * Deletes a progress entry identified by its UUID.
     *
     * @param progressEntryUuid the unique identifier of the progress entry to be deleted
     * @return a ResponseMessageDto containing the success message and code
     * @throws AppObjectNotFoundException if no progress entry is found with the provided UUID
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @progressEntrySecurity.isOwner(#progressEntryUuid, principal.uuid)")
    @Transactional
    public ResponseMessageDto deleteProgressEntry(String progressEntryUuid) {
        ProgressEntry progressEntry = progressEntryRepository.findByUuid(progressEntryUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("PROGRESS_ENTRY", "Progress entry not found"));

        progressEntryRepository.delete(progressEntry);

        return new ResponseMessageDto("PROGRESS_ENTRY_DELETED", "Progress entry deleted successfully");
    }
}

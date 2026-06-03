package com.project.fitness_nutrition_plan.security.method;

import com.project.fitness_nutrition_plan.repository.ProgressEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ProgressEntrySecurity {

    private final ProgressEntryRepository progressEntryRepository;

    @Transactional(readOnly = true)
    public boolean isOwner(String progressEntryUuid, String userUuid) {
        return progressEntryRepository.findByUuid(progressEntryUuid)
                .map(progressEntry -> userUuid != null
                        && progressEntry.getUser() != null
                        && userUuid.equals(progressEntry.getUser().getUuid()))
                .orElse(false);
    }
}

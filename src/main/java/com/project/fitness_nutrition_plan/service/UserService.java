package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.mapper.UserMapper;
import com.project.fitness_nutrition_plan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    public final UserRepository userRepository;
    public final UserMapper userMapper;



}

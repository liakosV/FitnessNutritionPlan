export type Role = 'ROLE_ADMIN' | 'ROLE_COACH' | 'ROLE_USER';

export interface AuthenticationRequestDto {
  username: string;
  password: string;
}

export interface AuthenticationResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface UserInsertDto {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdateDto {
  username?: string;
  email?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface UserReadDto {
  uuid: string;
  username: string;
  email: string;
  role: Role;
}

export interface WorkoutProgramInsertDto {
  name: string;
  description: string;
  assignedUserUuids: string[];
}

export interface WorkoutProgramUpdateDto {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface WorkoutProgramReadDto {
  uuid: string;
  name: string;
  description: string;
  active: boolean;
  coachUuid: string;
  coachUsername: string;
  assignedUserUuids: string[];
  assignedUsernames: string[];
}

export interface WorkoutDayInsertDto {
  dayName: string;
  workoutProgramUuid: string;
}

export interface WorkoutDayUpdateDto {
  dayName?: string;
}

export interface WorkoutDayReadDto {
  uuid: string;
  dayName: string;
  workoutProgramUuid: string;
  workoutProgramName: string;
}

export interface ExerciseInsertDto {
  name: string;
  sets: number;
  reps: number;
  restTime: number;
}

export interface ExerciseUpdateDto {
  name?: string;
  sets?: number;
  reps?: number;
  restTime?: number;
  workoutDayId?: number;
}

export interface ExerciseReadDto {
  uuid: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  workoutDayId: number;
}

export interface NutritionPlanInsertDto {
  title: string;
  description: string;
  active: boolean;
  assignedUserUuid: string;
}

export interface NutritionPlanUpdateDto {
  title?: string;
  description?: string;
  active?: boolean;
}

export interface NutritionPlanReadDto {
  uuid: string;
  title: string;
  description: string;
  active: boolean;
  coachUuid: string;
  coachUsername: string;
  assignedUserUuid: string;
  assignedUserUsername: string;
}

export interface MealInsertDto {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealUpdateDto {
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  nutritionPlanId?: number;
}

export interface MealReadDto {
  uuid: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutritionPlanId: number;
}

export interface ProgressEntryInsertDto {
  weight: number;
  bodyFat: number;
  notes?: string;
}

export interface ProgressEntryReadDto {
  uuid: string;
  weight: number;
  bodyFat: number;
  notes?: string;
  date: string;
  userId: number;
  username: string;
}

export interface MessageInsertDto {
  content: string;
  receiverUuid: string;
}

export interface MessageReadDto {
  uuid: string;
  content: string;
  timestamp: string;
  senderUuid: string;
  senderUsername: string;
  receiverUuid: string;
  receiverUsername: string;
}

export interface ResponseMessageDto {
  code: string;
  message: string;
}

export interface ErrorResponseDto {
  code: string;
  message: string;
  status: number;
  timestamp: string;
}

export interface AuthUser {
  username: string;
  role: Role;
  expiresAt?: number;
}

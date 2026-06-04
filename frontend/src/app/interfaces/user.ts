export interface User {
    username: string,
    email: string,
    password: string,
}

export interface Credentials {
    username: string,
    password: string
}

export interface AuthenticationResponseDto {
    accessToken: string,
    refreshToken: string
}

export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'STAFF'

export interface CurrentUser {
    username: string
    displayName: string
    role: UserRole
}

export interface LoginResponse extends CurrentUser {
    token: string
}

export type MeResponse = CurrentUser

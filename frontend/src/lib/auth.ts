import type { CurrentUser } from '../types/auth'

const TOKEN_KEY = 'gc_token'
const USER_KEY = 'gc_user'

export function getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser(): CurrentUser | null {
    try {
        const raw = localStorage.getItem(USER_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Partial<CurrentUser>
        if (!parsed.username || !parsed.displayName || !parsed.role) return null
        return {
            username: parsed.username,
            displayName: parsed.displayName,
            role: parsed.role,
        }
    } catch {
        return null
    }
}

export function setAuthSession(token: string, user: CurrentUser) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

export function hasRole(user: CurrentUser | null, ...roles: CurrentUser['role'][]): boolean {
    return !!user && roles.includes(user.role)
}

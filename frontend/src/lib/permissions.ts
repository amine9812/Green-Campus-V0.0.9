import type { CurrentUser } from '../types/auth'

export function isAdmin(user: CurrentUser | null): boolean {
    return user?.role === 'ADMIN'
}

export function isTechnician(user: CurrentUser | null): boolean {
    return user?.role === 'TECHNICIAN'
}

export function isStaff(user: CurrentUser | null): boolean {
    return user?.role === 'STAFF'
}

export function canManageRooms(user: CurrentUser | null): boolean {
    return isAdmin(user)
}

export function canManageAssets(user: CurrentUser | null): boolean {
    return isAdmin(user)
}

export function canCreateTicket(user: CurrentUser | null): boolean {
    return isTechnician(user)
}

export function canEditTicket(user: CurrentUser | null): boolean {
    return isTechnician(user) || isAdmin(user)
}

export function canDeleteTicket(user: CurrentUser | null): boolean {
    return isAdmin(user)
}

export function canAccessAdmin(user: CurrentUser | null): boolean {
    return isAdmin(user)
}

export function canAccessSchedule(user: CurrentUser | null): boolean {
    return isAdmin(user)
}

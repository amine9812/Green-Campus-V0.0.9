import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../lib/auth'
import { canAccessAdmin, canAccessSchedule } from '../lib/permissions'

interface Props {
    feature: 'admin' | 'schedule'
    children: ReactNode
}

export default function RoleGuard({ feature, children }: Props) {
    const user = getCurrentUser()
    const allowed = feature === 'admin' ? canAccessAdmin(user) : canAccessSchedule(user)

    if (!allowed) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

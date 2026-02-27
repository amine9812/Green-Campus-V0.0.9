import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchHealth } from '../api/client'
import { clearAuthSession, getCurrentUser } from '../lib/auth'
import { canAccessAdmin, canAccessSchedule } from '../lib/permissions'
import ChatWidget from '../components/ChatWidget'
import {
    LayoutDashboard,
    DoorOpen,
    Ticket,
    Calendar,
    Settings,
    Leaf,
    ChevronRight,
} from 'lucide-react'

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
    { to: '/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/schedule', icon: Calendar, label: 'Schedule', adminOnly: true },
    { to: '/admin', icon: Settings, label: 'Admin', adminOnly: true },
]

function DashboardLayout() {
    const location = useLocation()
    const currentUser = getCurrentUser()
    const [apiToast, setApiToast] = useState<string | null>(null)
    const visibleNavItems = navItems.filter((item) => {
        if (!item.adminOnly) return true
        return item.to === '/admin' ? canAccessAdmin(currentUser) : canAccessSchedule(currentUser)
    })

    const { data: health } = useQuery({
        queryKey: ['health'],
        queryFn: fetchHealth,
        refetchInterval: 30_000,
    })

    const isHealthy = health?.status === 'ok'

    useEffect(() => {
        const onApiError = (event: Event) => {
            const custom = event as CustomEvent<{ message?: string }>
            setApiToast(custom.detail?.message || 'Request failed')
        }
        window.addEventListener('gc-api-error', onApiError as EventListener)
        return () => window.removeEventListener('gc-api-error', onApiError as EventListener)
    }, [])

    useEffect(() => {
        if (!apiToast) return
        const timer = setTimeout(() => setApiToast(null), 3500)
        return () => clearTimeout(timer)
    }, [apiToast])

    // Get current page title
    const currentPage = navItems.find(
        (item) =>
            item.to === location.pathname ||
            (item.to !== '/' && location.pathname.startsWith(item.to))
    )

    return (
        <div className="flex h-screen bg-gray-50">
            {/* ========== SIDEBAR ========== */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-campus-500 to-campus-700 rounded-xl flex items-center justify-center shadow-md shadow-campus-500/20">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 leading-tight">
                            GreenCampus
                        </h1>
                        <p className="text-[10px] font-medium text-campus-600 uppercase tracking-wider">
                            Rooms
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {visibleNavItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : 'text-gray-600'}`
                                }
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Footer — Health Status */}
                <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs">
                        <div
                            className={`w-2 h-2 rounded-full pulse-dot ${isHealthy ? 'bg-campus-500' : 'bg-red-500'
                                }`}
                        />
                        <span className="text-gray-500">
                            API: {isHealthy ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </aside>

            {/* ========== MAIN AREA ========== */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="text-gray-400">GreenCampus</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        <span className="font-semibold text-gray-900">
                            {currentPage?.label || 'Dashboard'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* User info + logout */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-campus-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-campus-700">
                                    {(currentUser?.displayName || 'GC').slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 leading-tight">
                                    {currentUser?.displayName || 'Guest'}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    {currentUser?.role || ''}
                                </p>
                            </div>
                            <button
                                onClick={() => { clearAuthSession(); window.location.href = '/login'; }}
                                className="ml-2 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                                title="Logout"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {apiToast && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                            {apiToast}
                        </div>
                    )}
                    <Outlet />
                </main>
            </div>
            <ChatWidget />
        </div>
    )
}

export default DashboardLayout

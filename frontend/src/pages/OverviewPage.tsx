import { useQuery } from '@tanstack/react-query'
import { fetchHealth, fetchStats } from '../api/client'
import {
    DoorOpen,
    Ticket,
    Monitor,
    Calendar,
    Activity,
    Loader2,
} from 'lucide-react'

function OverviewPage() {
    const { data: health, isLoading: healthLoading } = useQuery({
        queryKey: ['health'],
        queryFn: fetchHealth,
    })

    const { data: stats } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
        refetchInterval: 30_000,
    })

    const kpiCards = [
        { label: 'Total Rooms', value: stats?.totalRooms ?? '—', icon: DoorOpen, color: 'bg-campus-50 text-campus-600', borderColor: 'border-campus-100' },
        { label: 'Open Tickets', value: stats?.openTickets ?? '—', icon: Ticket, color: 'bg-amber-50 text-amber-600', borderColor: 'border-amber-100' },
        { label: 'Broken PCs', value: stats?.brokenPcs ?? '—', icon: Monitor, color: 'bg-red-50 text-red-600', borderColor: 'border-red-100' },
        { label: 'Sessions', value: stats?.totalSessions ?? '—', icon: Calendar, color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-100' },
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Monitor campus rooms, equipment health, and maintenance at a glance.
                </p>
            </div>

            {/* Health Banner */}
            <div
                className={`rounded-xl border px-5 py-4 flex items-center gap-3 transition-all duration-300 ${healthLoading
                    ? 'bg-gray-50 border-gray-200'
                    : health?.status === 'ok'
                        ? 'bg-campus-50 border-campus-200'
                        : 'bg-red-50 border-red-200'
                    }`}
            >
                <div
                    className={`w-3 h-3 rounded-full pulse-dot ${health?.status === 'ok' ? 'bg-campus-500' : 'bg-red-500'}`}
                />
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        {healthLoading
                            ? 'Connecting to GreenCampus API...'
                            : health?.status === 'ok'
                                ? 'All systems operational'
                                : 'Backend connection failed'}
                    </p>
                    <p className="text-xs text-gray-500">
                        {health?.status === 'ok'
                            ? 'API is responding normally. Live data shown below.'
                            : 'Waiting for backend service to come online.'}
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, index) => {
                    const Icon = kpi.icon
                    return (
                        <div
                            key={kpi.label}
                            className={`bg-white rounded-xl border ${kpi.borderColor} p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in-up`}
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickLink to="/rooms" icon={DoorOpen} label="Manage Rooms" desc="View and edit room details" color="campus" />
                <QuickLink to="/tickets" icon={Ticket} label="Tickets" desc="Track maintenance requests" color="amber" />
                <QuickLink to="/schedule" icon={Calendar} label="Schedule" desc="View weekly timetable" color="blue" />
            </div>
        </div>
    )
}

function QuickLink({ to, icon: Icon, label, desc, color }: { to: string; icon: any; label: string; desc: string; color: string }) {
    return (
        <a href={to} className={`block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-${color}-200 transition-all group`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-50 text-${color}-600 mb-3`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-gray-900 group-hover:text-gray-700">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </a>
    )
}

export default OverviewPage

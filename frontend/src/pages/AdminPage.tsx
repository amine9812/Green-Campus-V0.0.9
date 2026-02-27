import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRooms, deleteRoom, fetchStats, fetchHealth, clearRoomSessions, fetchAuditLogs } from '../api/client'
import { getCurrentUser } from '../lib/auth'
import type { AuditLogEntry } from '../types/audit'
import type { RoomListItem } from '../types/room'
import {
    Settings, DoorOpen, Users, Activity, Trash2, ExternalLink,
    Monitor, Ticket, Calendar, Loader2, AlertTriangle, CheckCircle2
} from 'lucide-react'

export default function AdminPage() {
    const queryClient = useQueryClient()
    const [actionMsg, setActionMsg] = useState<string | null>(null)

    const { data: rooms = [], isLoading: roomsLoading } = useQuery({
        queryKey: ['rooms', {}],
        queryFn: () => fetchRooms({}),
    })

    const { data: stats } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
    })

    const { data: health } = useQuery({
        queryKey: ['health'],
        queryFn: fetchHealth,
    })

    const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
        queryKey: ['auditLogs'],
        queryFn: () => fetchAuditLogs(),
    })

    const deleteMut = useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            flash('Room deleted')
        },
    })

    const clearSessionsMut = useMutation({
        mutationFn: (roomId: number) => clearRoomSessions(roomId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            flash('Sessions cleared')
        },
    })

    function flash(msg: string) {
        setActionMsg(msg)
        setTimeout(() => setActionMsg(null), 3000)
    }

    // User data from localStorage
    const currentUser = getCurrentUser()
    const userRole = currentUser?.role || 'UNKNOWN'
    const isAdmin = userRole === 'ADMIN'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Tools</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage rooms, users, and system settings.
                    </p>
                </div>
                {actionMsg && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-campus-50 text-campus-700 text-sm font-medium rounded-lg border border-campus-200 animate-fade-in-up">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {actionMsg}
                    </span>
                )}
            </div>

            {/* Access Warning */}
            {!isAdmin && (
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Read-only access. Only admin users can modify data.</span>
                </div>
            )}

            {/* System Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InfoCard icon={Activity} label="API Status" value={health?.status === 'ok' ? 'Operational' : 'Offline'} color={health?.status === 'ok' ? 'campus' : 'red'} />
                <InfoCard icon={DoorOpen} label="Rooms" value={String(stats?.totalRooms ?? '—')} color="campus" />
                <InfoCard icon={Ticket} label="Open Tickets" value={String(stats?.openTickets ?? '—')} color="amber" />
                <InfoCard icon={Calendar} label="Sessions" value={String(stats?.totalSessions ?? '—')} color="blue" />
            </div>

            {/* Room Management */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-campus-600" />
                    <h3 className="text-sm font-bold text-gray-900">Room Management</h3>
                    <span className="text-xs text-gray-400 ml-auto">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
                </div>
                {roomsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-campus-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">Code</th>
                                    <th className="px-5 py-3">Name</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Capacity</th>
                                    <th className="px-5 py-3">Health</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rooms.map((r: RoomListItem) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-mono font-bold text-campus-700">{r.code}</td>
                                        <td className="px-5 py-3 text-gray-900">{r.code}</td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                {r.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{r.capacity}</td>
                                        <td className="px-5 py-3">
                                            <HealthBar value={r.healthScore} />
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${r.status === 'OPEN' ? 'bg-campus-50 text-campus-700' : 'bg-red-50 text-red-700'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <a
                                                    href={`/rooms/${r.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-campus-50 text-gray-400 hover:text-campus-600 transition-colors"
                                                    title="View"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => { if (confirm(`Delete room ${r.code}?`)) deleteMut.mutate(r.id) }}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Management (readonly) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-900">User Accounts</h3>
                    <span className="text-xs text-gray-400 ml-auto">Demo accounts</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Username</th>
                                <th className="px-5 py-3">Display Name</th>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3">Password</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { user: 'admin', name: 'Admin User', role: 'ADMIN', pw: 'admin123' },
                                { user: 'tech', name: 'Tech Support', role: 'TECHNICIAN', pw: 'tech123' },
                                { user: 'staff', name: 'Teaching Staff', role: 'STAFF', pw: 'staff123' },
                            ].map(u => (
                                <tr key={u.user} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-mono font-bold text-gray-900">{u.user}</td>
                                    <td className="px-5 py-3 text-gray-700">{u.name}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : u.role === 'TECHNICIAN' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{u.pw}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-700" />
                    <h3 className="text-sm font-bold text-gray-900">Audit Log</h3>
                    <span className="text-xs text-gray-400 ml-auto">{auditLogs.length} entries</span>
                </div>
                {auditLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-campus-500" />
                    </div>
                ) : auditLogs.length === 0 ? (
                    <div className="px-5 py-8 text-sm text-gray-400 text-center">
                        No audit entries yet
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">Time</th>
                                    <th className="px-5 py-3">Actor</th>
                                    <th className="px-5 py-3">Action</th>
                                    <th className="px-5 py-3">Entity</th>
                                    <th className="px-5 py-3">Summary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {auditLogs.slice(0, 50).map((log) => (
                                    <AuditLogRow key={log.id} log={log} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function InfoCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${color}-50 text-${color}-600 mb-2`}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
    )
}

function HealthBar({ value }: { value: number }) {
    const bg = value >= 80 ? 'bg-campus-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${bg}`} style={{ width: `${value}%` }} />
            </div>
            <span className="text-xs text-gray-500 font-medium">{value}%</span>
        </div>
    )
}

function AuditLogRow({ log }: { log: AuditLogEntry }) {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                {new Date(log.eventTimestamp).toLocaleString()}
            </td>
            <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-800">{log.actorUsername}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                        {log.actorRole}
                    </span>
                </div>
            </td>
            <td className="px-5 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${log.actionType === 'DELETE'
                    ? 'bg-red-50 text-red-700'
                    : log.actionType === 'CREATE'
                        ? 'bg-campus-50 text-campus-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                    {log.actionType}
                </span>
            </td>
            <td className="px-5 py-3 text-xs text-gray-700">
                {log.entityType}#{log.entityId ?? '—'}
            </td>
            <td className="px-5 py-3 text-xs text-gray-600 max-w-[480px] truncate" title={log.summary ?? ''}>
                {log.summary || '—'}
            </td>
        </tr>
    )
}

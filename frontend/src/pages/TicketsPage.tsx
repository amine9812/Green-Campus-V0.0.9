import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTickets, fetchRooms, createTicket, updateTicketStatus as apiUpdateStatus, deleteTicket as apiDeleteTicket } from '../api/client'
import { getCurrentUser } from '../lib/auth'
import { canCreateTicket, canDeleteTicket, canEditTicket } from '../lib/permissions'
import type { Ticket, TicketPriority, TicketStatus, TicketCreatePayload, RoomListItem } from '../types/room'
import {
    TicketPlus, Search, Filter, Loader2, AlertTriangle,
    CircleDot, Clock, CheckCircle2, Trash2, ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const priorityBadge: Record<TicketPriority, string> = {
    P1: 'bg-red-100 text-red-700 border-red-200',
    P2: 'bg-amber-100 text-amber-700 border-amber-200',
    P3: 'bg-gray-100 text-gray-500 border-gray-200',
}
const statusIcon: Record<TicketStatus, React.ReactNode> = {
    OPEN: <CircleDot className="w-4 h-4 text-red-500" />,
    IN_PROGRESS: <Clock className="w-4 h-4 text-amber-500" />,
    RESOLVED: <CheckCircle2 className="w-4 h-4 text-campus-500" />,
}
const statusLabel: Record<TicketStatus, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
}

export default function TicketsPage() {
    const queryClient = useQueryClient()
    const currentUser = getCurrentUser()
    const canCreate = canCreateTicket(currentUser)
    const canEdit = canEditTicket(currentUser)
    const canDelete = canDeleteTicket(currentUser)
    const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('')
    const [showCreate, setShowCreate] = useState(false)
    const [pageError, setPageError] = useState<string | null>(null)

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['tickets', statusFilter, priorityFilter],
        queryFn: () => fetchTickets({
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
        }),
    })

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: TicketStatus }) => apiUpdateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
        },
        onError: (err: any) => setPageError(err?.response?.data?.error || 'Failed to update ticket'),
    })

    const deleteMut = useMutation({
        mutationFn: (id: number) => apiDeleteTicket(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
        },
        onError: (err: any) => setPageError(err?.response?.data?.error || 'Failed to delete ticket'),
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
                    <p className="text-sm text-gray-500 mt-1">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
                    {!canCreate && (
                        <p className="text-xs text-amber-700 mt-1">
                            {currentUser?.role === 'STAFF'
                                ? 'Read-only access. Staff can view tickets only.'
                                : 'Ticket creation is technician-only.'}
                        </p>
                    )}
                </div>
                {canCreate && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-campus-500 text-white text-sm font-semibold rounded-xl hover:bg-campus-600 transition-colors shadow-sm"
                    >
                        <TicketPlus className="w-4 h-4" /> New Ticket
                    </button>
                )}
            </div>

            {pageError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {pageError}
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="w-4 h-4" />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as TicketStatus | '')}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-campus-200 focus:border-campus-400 outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value as TicketPriority | '')}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-campus-200 focus:border-campus-400 outline-none"
                >
                    <option value="">All Priorities</option>
                    <option value="P1">P1 — Critical</option>
                    <option value="P2">P2 — Medium</option>
                    <option value="P3">P3 — Low</option>
                </select>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-campus-500 animate-spin" />
                </div>
            )}

            {/* Empty */}
            {!isLoading && tickets.length === 0 && (
                <div className="text-center py-16">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No tickets match your filters</p>
                </div>
            )}

            {/* Ticket Table */}
            {!isLoading && tickets.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
                                <th className="text-left px-5 py-3">Status</th>
                                <th className="text-left px-5 py-3">Priority</th>
                                <th className="text-left px-5 py-3">Title</th>
                                <th className="text-left px-5 py-3">Room</th>
                                <th className="text-left px-5 py-3">Created</th>
                                <th className="text-right px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tickets.map(t => (
                                <TicketRow
                                    key={t.id}
                                    ticket={t}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                    onStatusChange={(status) => {
                                        setPageError(null)
                                        updateStatus.mutate({ id: t.id, status })
                                    }}
                                    onDelete={() => {
                                        setPageError(null)
                                        if (confirm('Delete this ticket?')) deleteMut.mutate(t.id)
                                    }}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Ticket Modal */}
            {showCreate && canCreate && <CreateTicketModal onClose={() => setShowCreate(false)} />}
        </div>
    )
}

// ──────── Ticket Row ────────

function TicketRow({ ticket: t, canEdit, canDelete, onStatusChange, onDelete }: {
    ticket: Ticket
    canEdit: boolean
    canDelete: boolean
    onStatusChange: (s: TicketStatus) => void
    onDelete: () => void
}) {
    const nextStatus: Record<TicketStatus, TicketStatus> = {
        OPEN: 'IN_PROGRESS',
        IN_PROGRESS: 'RESOLVED',
        RESOLVED: 'OPEN',
    }

    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-5 py-3">
                {canEdit ? (
                    <button
                        onClick={() => onStatusChange(nextStatus[t.status])}
                        className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
                        title={`Click to change to ${statusLabel[nextStatus[t.status]]}`}
                    >
                        {statusIcon[t.status]}
                        <span>{statusLabel[t.status]}</span>
                    </button>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        {statusIcon[t.status]}
                        <span>{statusLabel[t.status]}</span>
                    </span>
                )}
            </td>
            <td className="px-5 py-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityBadge[t.priority]}`}>
                    {t.priority}
                </span>
            </td>
            <td className="px-5 py-3">
                <p className="text-sm font-medium text-gray-900">{t.title}</p>
                {t.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{t.description}</p>
                )}
            </td>
            <td className="px-5 py-3">
                <Link
                    to={`/rooms/${t.roomId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-campus-600 hover:text-campus-800"
                >
                    {t.roomCode} <ChevronRight className="w-3 h-3" />
                </Link>
            </td>
            <td className="px-5 py-3">
                <span className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
            </td>
            <td className="px-5 py-3 text-right">
                {canDelete ? (
                    <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <span className="inline-block w-6" />
                )}
            </td>
        </tr>
    )
}

// ──────── Create Ticket Modal ────────

function CreateTicketModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<TicketCreatePayload>({
        roomId: 0,
        title: '',
        description: '',
        priority: 'P2',
    })
    const [error, setError] = useState('')

    const { data: rooms = [] } = useQuery<RoomListItem[]>({
        queryKey: ['rooms'],
        queryFn: () => fetchRooms(),
    })

    const mutation = useMutation({
        mutationFn: createTicket,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
            onClose()
        },
        onError: (err: any) => setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to create ticket'),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.roomId) return setError('Please select a room')
        if (!form.title.trim()) return setError('Title is required')
        mutation.mutate(form)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 animate-in zoom-in-95"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">New Ticket</h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    {/* Room */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Room</label>
                        <select
                            value={form.roomId}
                            onChange={e => setForm(f => ({ ...f, roomId: Number(e.target.value) }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-campus-200 focus:border-campus-400 outline-none"
                        >
                            <option value={0}>Select a room…</option>
                            {rooms.map(r => (
                                <option key={r.id} value={r.id}>{r.code} — {r.type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Brief description of the issue"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-campus-200 focus:border-campus-400 outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={3}
                            placeholder="Detailed description…"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-campus-200 focus:border-campus-400 outline-none resize-none"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
                        <div className="flex gap-2">
                            {(['P1', 'P2', 'P3'] as TicketPriority[]).map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${form.priority === p
                                            ? priorityBadge[p] + ' border-current'
                                            : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-campus-500 text-white text-sm font-semibold rounded-lg hover:bg-campus-600 transition-colors disabled:opacity-50"
                        >
                            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TicketPlus className="w-4 h-4" />}
                            Create Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

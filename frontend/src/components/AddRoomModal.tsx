import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRoom } from '../api/client'
import type { RoomType, RoomStatus, RoomCreatePayload } from '../types/room'
import { X, Loader2 } from 'lucide-react'

interface Props {
    open: boolean
    onClose: () => void
}

export default function AddRoomModal({ open, onClose }: Props) {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<RoomCreatePayload>({
        code: '',
        type: 'CLASS',
        capacity: 30,
        status: 'OPEN',
        totalTables: 0,
        tablesHavePcs: false,
        notes: '',
    })
    const [error, setError] = useState<string | null>(null)

    const mutation = useMutation({
        mutationFn: createRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
            onClose()
            resetForm()
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message || err?.message || 'Failed to create room')
        },
    })

    const resetForm = () => {
        setForm({
            code: '', type: 'CLASS', capacity: 30, status: 'OPEN',
            totalTables: 0, tablesHavePcs: false, notes: '',
        })
        setError(null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.code.trim()) {
            setError('Room code is required')
            return
        }
        setError(null)
        mutation.mutate(form)
    }

    const set = (key: keyof RoomCreatePayload, value: any) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Add New Room</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Room Code *</label>
                            <input
                                type="text" value={form.code}
                                onChange={(e) => set('code', e.target.value)}
                                placeholder="e.g. A1, LAB-A1"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                            <select
                                value={form.type}
                                onChange={(e) => set('type', e.target.value as RoomType)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500"
                            >
                                <option value="CLASS">Classroom</option>
                                <option value="LAB">Lab</option>
                                <option value="AMPHI">Amphitheatre</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                            <input
                                type="number" value={form.capacity} min={1}
                                onChange={(e) => set('capacity', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => set('status', e.target.value as RoomStatus)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500"
                            >
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Total Tables</label>
                            <input
                                type="number" value={form.totalTables} min={0}
                                onChange={(e) => set('totalTables', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500"
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox" checked={form.tablesHavePcs}
                                    onChange={(e) => set('tablesHavePcs', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-campus-500 focus:ring-campus-500"
                                />
                                <span className="text-sm text-gray-700">Tables have PCs</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => set('notes', e.target.value)}
                            rows={2}
                            placeholder="Optional description..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500 resize-none"
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button" onClick={() => { resetForm(); onClose() }}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={mutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-campus-500 rounded-lg hover:bg-campus-600 transition-colors disabled:opacity-60 shadow-sm shadow-campus-500/20"
                        >
                            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

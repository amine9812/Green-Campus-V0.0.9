import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { fetchRooms } from '../api/client'
import type { RoomType, RoomStatus, RoomSearchParams, RoomListItem } from '../types/room'
import AddRoomModal from '../components/AddRoomModal'
import {
    Search, X, DoorOpen, Monitor, MonitorX, Projector,
    Loader2, AlertTriangle, Plus, Filter, Heart,
} from 'lucide-react'

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useMemo(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debouncedValue
}

function RoomsPage() {
    const navigate = useNavigate()
    const [searchText, setSearchText] = useState('')
    const [typeFilter, setTypeFilter] = useState<RoomType | ''>('')
    const [statusFilter, setStatusFilter] = useState<RoomStatus | ''>('')
    const [showFilters, setShowFilters] = useState(false)
    const [addModalOpen, setAddModalOpen] = useState(false)

    const debouncedSearch = useDebounce(searchText, 300)

    const params = useMemo<RoomSearchParams>(() => {
        const p: RoomSearchParams = {}
        if (debouncedSearch) p.q = debouncedSearch
        if (typeFilter) p.type = typeFilter
        if (statusFilter) p.status = statusFilter
        return p
    }, [debouncedSearch, typeFilter, statusFilter])

    const { data: rooms, isLoading, isError } = useQuery({
        queryKey: ['rooms', params],
        queryFn: () => fetchRooms(params),
    })

    const clearFilters = useCallback(() => {
        setSearchText('')
        setTypeFilter('')
        setStatusFilter('')
    }, [])

    const hasActiveFilters = searchText || typeFilter || statusFilter

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Browse and manage campus rooms, labs, and amphitheatres.
                    </p>
                </div>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-campus-500 text-white text-sm font-medium rounded-lg hover:bg-campus-600 transition-colors shadow-sm shadow-campus-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Room
                </button>
            </div>

            {/* Search + Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search rooms by code — A1, LAB-A1, AMPHI-01…"
                            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500 transition-all"
                        />
                        {searchText && (
                            <button
                                onClick={() => setSearchText('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${showFilters || hasActiveFilters
                                ? 'bg-campus-50 border-campus-200 text-campus-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-campus-500"></span>}
                    </button>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                            Clear all
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as RoomType | '')}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500"
                            >
                                <option value="">All</option>
                                <option value="CLASS">Classroom</option>
                                <option value="LAB">Lab</option>
                                <option value="AMPHI">Amphitheatre</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as RoomStatus | '')}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-campus-500/20 focus:border-campus-500"
                            >
                                <option value="">All</option>
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-campus-500 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading rooms…</p>
                </div>
            ) : isError ? (
                <div className="bg-white rounded-xl border border-red-200 p-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load rooms</h3>
                    <p className="text-sm text-gray-500">Check that the backend is running on port 8080.</p>
                </div>
            ) : rooms && rooms.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-campus-50 rounded-2xl flex items-center justify-center mb-4">
                        <DoorOpen className="w-8 h-8 text-campus-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {hasActiveFilters ? 'No rooms match your filters' : 'No rooms yet'}
                    </h3>
                    <p className="text-sm text-gray-500 text-center max-w-sm">
                        {hasActiveFilters ? 'Try adjusting your search or filters.' : 'Add your first room using the button above.'}
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-xs text-gray-400 font-medium">
                        {rooms?.length} room{rooms?.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {rooms?.map((room) => (
                            <RoomCard key={room.id} room={room} onClick={() => navigate(`/rooms/${room.id}`)} />
                        ))}
                    </div>
                </>
            )}

            {/* Add Room Modal */}
            <AddRoomModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
        </div>
    )
}

// ────────────────────────────────────────────────────
function RoomCard({ room, onClick }: { room: RoomListItem; onClick: () => void }) {
    const typeLabel = { CLASS: 'Classroom', LAB: 'Lab', AMPHI: 'Amphitheatre' }
    const typeColor = { CLASS: 'bg-blue-50 text-blue-700', LAB: 'bg-purple-50 text-purple-700', AMPHI: 'bg-amber-50 text-amber-700' }
    const healthColor = room.healthScore >= 80 ? 'text-campus-600' : room.healthScore >= 50 ? 'text-amber-600' : 'text-red-600'
    const healthBg = room.healthScore >= 80 ? 'bg-campus-50' : room.healthScore >= 50 ? 'bg-amber-50' : 'bg-red-50'
    const statusBadge = room.status === 'CLOSED' ? 'bg-red-100 text-red-700' : room.occupancyStatus === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' : 'bg-campus-100 text-campus-700'

    return (
        <div onClick={onClick} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-campus-200 transition-all duration-200 overflow-hidden group cursor-pointer">
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-campus-700 transition-colors">{room.code}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${typeColor[room.type]}`}>{typeLabel[room.type]}</span>
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusBadge}`}>{room.status === 'CLOSED' ? 'Closed' : room.occupancyStatus === 'OCCUPIED' ? 'Occupied' : 'Idle'}</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${healthBg}`}>
                        <Heart className={`w-3.5 h-3.5 ${healthColor}`} />
                        <span className={`text-sm font-bold ${healthColor}`}>{room.healthScore}%</span>
                    </div>
                </div>
                {room.notes && <p className="text-xs text-gray-500 line-clamp-1 mb-3">{room.notes}</p>}
            </div>
            <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 grid grid-cols-4 gap-2">
                <StatCell label="Capacity" value={room.capacity.toString()} />
                <StatCell label="Tables" value={room.totalTables.toString()} />
                <StatCell label="PCs" value={room.tablesHavePcs ? `${room.workingPcs}/${room.totalPcs}` : '—'} icon={room.brokenPcs > 0 ? <MonitorX className="w-3 h-3 text-red-500" /> : <Monitor className="w-3 h-3 text-campus-500" />} />
                <StatCell label="Projector" value={room.hasProjector ? (room.projectorStatus === 'WORKING' ? '✓' : '✗') : '—'} icon={<Projector className="w-3 h-3 text-gray-400" />} />
            </div>
        </div>
    )
}

function StatCell({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-1">{icon}<span className="text-sm font-semibold text-gray-900">{value}</span></div>
            <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}

export default RoomsPage

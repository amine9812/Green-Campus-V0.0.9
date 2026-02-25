import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRoomById, deleteRoom, updateAssetStatus } from '../api/client'
import RoomLayout from '../components/RoomLayout'
import type { AssetItem, AssetStatus } from '../types/room'
import {
    ArrowLeft, Loader2, AlertTriangle, Trash2, Edit, Monitor,
    MonitorX, Projector, Laptop, Heart, DoorOpen, MapPin,
} from 'lucide-react'

const typeLabel: Record<string, string> = { CLASS: 'Classroom', LAB: 'Lab', AMPHI: 'Amphitheatre' }
const typeColor: Record<string, string> = {
    CLASS: 'bg-blue-50 text-blue-700', LAB: 'bg-purple-50 text-purple-700', AMPHI: 'bg-amber-50 text-amber-700',
}

export default function RoomDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const roomId = Number(id)

    const { data: room, isLoading, isError } = useQuery({
        queryKey: ['room', roomId],
        queryFn: () => fetchRoomById(roomId),
        enabled: !!roomId,
    })

    const deleteMut = useMutation({
        mutationFn: () => deleteRoom(roomId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
            navigate('/rooms')
        },
    })

    const toggleAssetStatus = useMutation({
        mutationFn: ({ assetId, status }: { assetId: number; status: AssetStatus }) =>
            updateAssetStatus(assetId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['room', roomId] })
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
        },
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-campus-500 animate-spin" />
            </div>
        )
    }

    if (isError || !room) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertTriangle className="w-12 h-12 text-red-400" />
                <p className="text-gray-500">Room not found</p>
                <button onClick={() => navigate('/rooms')} className="text-campus-600 font-medium text-sm hover:underline">
                    ← Back to Rooms
                </button>
            </div>
        )
    }

    const healthColor = room.healthScore >= 80 ? 'text-campus-600' : room.healthScore >= 50 ? 'text-amber-600' : 'text-red-600'
    const healthBg = room.healthScore >= 80 ? 'bg-campus-50' : room.healthScore >= 50 ? 'bg-amber-50' : 'bg-red-50'

    const projector = room.assets.find(a => a.type === 'PROJECTOR')
    const teacherPc = room.assets.find(a => a.type === 'TEACHER_PC')
    const tablePcs = room.assets.filter(a => a.type === 'TABLE_PC').sort((a, b) => (a.tableIndex ?? 0) - (b.tableIndex ?? 0))

    const handleToggle = (asset: AssetItem) => {
        const newStatus: AssetStatus = asset.status === 'WORKING' ? 'BROKEN' : 'WORKING'
        toggleAssetStatus.mutate({ assetId: asset.id, status: newStatus })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/rooms')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-900">{room.code}</h2>
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${typeColor[room.type]}`}>
                                {typeLabel[room.type]}
                            </span>
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${room.status === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-campus-100 text-campus-700'
                                }`}>
                                {room.status === 'CLOSED' ? 'Closed' : room.occupancyStatus}
                            </span>
                        </div>
                        {room.notes && <p className="text-sm text-gray-500 mt-1">{room.notes}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {/* TODO BOX 2 extension: edit modal */ }}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                        onClick={() => { if (confirm('Delete this room?')) deleteMut.mutate() }}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <SummaryCard icon={<MapPin className="w-4 h-4" />} label="Capacity" value={room.capacity.toString()} color="bg-gray-50 text-gray-600" />
                <SummaryCard icon={<DoorOpen className="w-4 h-4" />} label="Tables" value={room.totalTables.toString()} color="bg-gray-50 text-gray-600" />
                <SummaryCard icon={<Monitor className="w-4 h-4" />} label="Working PCs" value={`${room.workingPcs}/${room.totalPcs}`} color={room.brokenPcs ? 'bg-amber-50 text-amber-600' : 'bg-campus-50 text-campus-600'} />
                <SummaryCard icon={<MonitorX className="w-4 h-4" />} label="Broken PCs" value={room.brokenPcs.toString()} color={room.brokenPcs ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'} />
                <SummaryCard icon={<Projector className="w-4 h-4" />} label="Projector" value={room.projectorStatus === 'WORKING' ? 'Working' : room.projectorStatus === 'BROKEN' ? 'Broken' : 'N/A'} color={room.projectorStatus === 'BROKEN' ? 'bg-red-50 text-red-600' : 'bg-campus-50 text-campus-600'} />
                <SummaryCard icon={<Heart className="w-4 h-4" />} label="Health" value={`${room.healthScore}%`} color={healthBg + ' ' + healthColor} />
            </div>

            {/* Equipment / Assets */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Equipment & Assets</h3>
                </div>

                <div className="p-5 space-y-6">
                    {/* Projector & Teacher PC */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {projector && (
                            <AssetToggleCard asset={projector} onToggle={handleToggle} icon={<Projector className="w-5 h-5" />} />
                        )}
                        {teacherPc && (
                            <AssetToggleCard asset={teacherPc} onToggle={handleToggle} icon={<Laptop className="w-5 h-5" />} />
                        )}
                    </div>

                    {/* Table PCs */}
                    {tablePcs.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                                Table PCs ({room.workingPcs}/{room.totalPcs} working)
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {tablePcs.map((pc) => (
                                    <button
                                        key={pc.id}
                                        onClick={() => handleToggle(pc)}
                                        className={`p-3 rounded-lg border-2 text-center transition-all hover:shadow-md cursor-pointer ${pc.status === 'WORKING'
                                            ? 'border-campus-200 bg-campus-50/50 hover:border-campus-400'
                                            : 'border-red-200 bg-red-50/50 hover:border-red-400'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center mb-1">
                                            {pc.status === 'WORKING'
                                                ? <Monitor className="w-5 h-5 text-campus-500" />
                                                : <MonitorX className="w-5 h-5 text-red-500" />}
                                        </div>
                                        <p className="text-xs font-semibold text-gray-900">T{pc.tableIndex}</p>
                                        <p className={`text-[10px] font-medium ${pc.status === 'WORKING' ? 'text-campus-600' : 'text-red-600'}`}>
                                            {pc.label} • {pc.status}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No table PCs */}
                    {tablePcs.length === 0 && room.tablesHavePcs && (
                        <p className="text-sm text-gray-400 italic">Table PCs not yet initialized.</p>
                    )}
                </div>
            </div>

            {/* Visual Room Layout */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Room Layout</h3>
                </div>
                <div className="p-5">
                    <RoomLayout room={room} onToggleAsset={handleToggle} />
                </div>
            </div>

            {/* Tickets placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tickets</h3>
                <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400">Tickets coming in BOX 4</p>
                </div>
            </div>
        </div>
    )
}

// ──────── Sub-components ────────

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div className={`rounded-xl p-3 ${color}`}>
            <div className="flex items-center gap-2 mb-1">{icon}</div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-[10px] mt-0.5 opacity-70">{label}</p>
        </div>
    )
}

function AssetToggleCard({ asset, onToggle, icon }: { asset: AssetItem; onToggle: (a: AssetItem) => void; icon: React.ReactNode }) {
    const isWorking = asset.status === 'WORKING'
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isWorking ? 'border-campus-200 bg-campus-50/30' : 'border-red-200 bg-red-50/30'
            }`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isWorking ? 'bg-campus-100 text-campus-600' : 'bg-red-100 text-red-600'}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{asset.label}</p>
                    <p className={`text-xs font-medium ${isWorking ? 'text-campus-600' : 'text-red-600'}`}>{asset.status}</p>
                </div>
            </div>
            <button
                onClick={() => onToggle(asset)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isWorking
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-campus-100 text-campus-700 hover:bg-campus-200'
                    }`}
            >
                {isWorking ? 'Mark Broken' : 'Mark Working'}
            </button>
        </div>
    )
}

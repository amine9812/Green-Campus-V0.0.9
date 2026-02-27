import type { AssetItem, AssetStatus, RoomDetail } from '../types/room'
import { Monitor, MonitorX, Projector, Laptop, SquareStack } from 'lucide-react'

interface RoomLayoutProps {
    room: RoomDetail
    onToggleAsset?: (asset: AssetItem) => void
    readOnly?: boolean
}

export default function RoomLayout({ room, onToggleAsset, readOnly = false }: RoomLayoutProps) {
    const projector = room.assets.find(a => a.type === 'PROJECTOR')
    const teacherPc = room.assets.find(a => a.type === 'TEACHER_PC')
    const tablePcs = room.assets
        .filter(a => a.type === 'TABLE_PC')
        .sort((a, b) => (a.tableIndex ?? 0) - (b.tableIndex ?? 0))

    // Layout grid: compute rows/cols for tables
    const tableCount = room.totalTables
    const cols = tableCount <= 4 ? 2 : tableCount <= 9 ? 3 : 4
    const rows = Math.ceil(tableCount / cols)

    return (
        <div className="space-y-4">
            {/* Top row: Teacher desk + Projector */}
            <div className="flex items-center justify-between">
                {/* Projector — top center */}
                {projector && (
                    <EquipmentBadge
                        icon={<Projector className="w-4 h-4" />}
                        label="Projector"
                        status={projector.status}
                        onClick={onToggleAsset ? () => onToggleAsset(projector) : undefined}
                        readOnly={readOnly}
                    />
                )}
                {/* Teacher PC */}
                {teacherPc && (
                    <EquipmentBadge
                        icon={<Laptop className="w-4 h-4" />}
                        label="Teacher PC"
                        status={teacherPc.status}
                        onClick={onToggleAsset ? () => onToggleAsset(teacherPc) : undefined}
                        readOnly={readOnly}
                    />
                )}
            </div>

            {/* Whiteboard / Screen indicator */}
            <div className="mx-auto w-3/4 h-2 bg-gray-300 rounded-full" title="Whiteboard / Screen" />

            {/* Tables grid */}
            {tablePcs.length > 0 ? (
                <div
                    className="grid gap-2 py-4"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    }}
                >
                    {tablePcs.map((pc, i) => (
                        <TableCell
                            key={pc.id}
                            pc={pc}
                            index={i + 1}
                            onClick={onToggleAsset ? () => onToggleAsset(pc) : undefined}
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            ) : tableCount > 0 ? (
                <div
                    className="grid gap-2 py-4"
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                    {Array.from({ length: tableCount }, (_, i) => (
                        <div key={i} className="aspect-[3/2] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                            <SquareStack className="w-4 h-4 text-gray-300" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center text-sm text-gray-400">
                    No tables in this room
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
                <LegendItem color="bg-campus-400" label="Working" />
                <LegendItem color="bg-red-400" label="Broken" />
                <span className="text-[10px] text-gray-400 italic">
                    {readOnly ? 'Read-only layout view' : 'Click a PC to toggle status'}
                </span>
            </div>
        </div>
    )
}

// ──────── Sub-components ────────

function TableCell({ pc, index, onClick, readOnly = false }: { pc: AssetItem; index: number; onClick?: () => void; readOnly?: boolean }) {
    const working = pc.status === 'WORKING'
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={readOnly}
            className={`group relative aspect-[3/2] rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.03] ${working
                    ? 'border-campus-200 bg-campus-50/60 hover:border-campus-400'
                    : 'border-red-200 bg-red-50/60 hover:border-red-400'
                } ${readOnly ? 'cursor-default hover:shadow-none hover:scale-100 opacity-90' : ''}`}
            title={readOnly ? `${pc.label} — ${pc.status}` : `${pc.label} — ${pc.status} (click to toggle)`}
        >
            {/* Status dot */}
            <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${working ? 'bg-campus-400' : 'bg-red-400'} ${working ? '' : 'animate-pulse'}`} />

            {working
                ? <Monitor className="w-5 h-5 text-campus-500 mb-0.5" />
                : <MonitorX className="w-5 h-5 text-red-500 mb-0.5" />
            }
            <span className="text-[10px] font-bold text-gray-700">T{pc.tableIndex}</span>
        </button>
    )
}

function EquipmentBadge({ icon, label, status, onClick, readOnly = false }: {
    icon: React.ReactNode
    label: string
    status: AssetStatus
    onClick?: () => void
    readOnly?: boolean
}) {
    const working = status === 'WORKING'
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={readOnly}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${working
                    ? 'border-campus-200 bg-campus-50/50 text-campus-700 hover:border-campus-400'
                    : 'border-red-200 bg-red-50/50 text-red-700 hover:border-red-400'
                } ${readOnly ? 'cursor-default hover:shadow-none opacity-90' : ''}`}
            title={readOnly ? `${label}: ${status}` : `${label}: ${status} (click to toggle)`}
        >
            {icon}
            <span className="text-xs font-semibold">{label}</span>
            <span className={`w-2 h-2 rounded-full ${working ? 'bg-campus-400' : 'bg-red-400 animate-pulse'}`} />
        </button>
    )
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-[10px] font-medium text-gray-500">{label}</span>
        </div>
    )
}

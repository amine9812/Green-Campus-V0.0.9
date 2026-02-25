import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSessions, importSessionsCsv, fetchAbsences, createAbsence, deleteAbsence, fetchFreeRooms } from '../api/client'
import type { Session, DayOfWeek, Absence, FreeRoom } from '../types/room'
import {
    Upload, Loader2, Calendar, Trash2, AlertTriangle,
    UserX, DoorOpen, ChevronDown, ChevronRight, Plus, CheckCircle2
} from 'lucide-react'

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const DAY_SHORT: Record<DayOfWeek, string> = {
    MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
    FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
}
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
const SLOT_COLORS = [
    'bg-campus-50 border-campus-200 text-campus-800',
    'bg-blue-50 border-blue-200 text-blue-800',
    'bg-purple-50 border-purple-200 text-purple-800',
    'bg-amber-50 border-amber-200 text-amber-800',
    'bg-rose-50 border-rose-200 text-rose-800',
    'bg-cyan-50 border-cyan-200 text-cyan-800',
    'bg-orange-50 border-orange-200 text-orange-800',
]

type Tab = 'timetable' | 'absences'

export default function SchedulePage() {
    const queryClient = useQueryClient()
    const fileRef = useRef<HTMLInputElement>(null)
    const [importResult, setImportResult] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>('timetable')

    // Timetable data
    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['sessions'],
        queryFn: fetchSessions,
    })

    const importMut = useMutation({
        mutationFn: importSessionsCsv,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
            setImportResult(`✓ Imported ${res.imported} sessions`)
            setTimeout(() => setImportResult(null), 4000)
        },
        onError: (err: any) => setImportResult(`✗ ${err?.response?.data?.error || 'Import failed'}`),
    })

    const handleImport = () => {
        const file = fileRef.current?.files?.[0]
        if (file) importMut.mutate(file)
    }

    // Build room→color map
    const roomCodes = [...new Set(sessions.map(s => s.roomCode))]
    const roomColor = Object.fromEntries(roomCodes.map((c, i) => [c, SLOT_COLORS[i % SLOT_COLORS.length]]))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {sessions.length} session{sessions.length !== 1 ? 's' : ''} across {roomCodes.length} room{roomCodes.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {importResult && (
                        <span className={`text-sm font-medium ${importResult.startsWith('✓') ? 'text-campus-600' : 'text-red-600'}`}>
                            {importResult}
                        </span>
                    )}
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={importMut.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-campus-500 text-white text-sm font-semibold rounded-xl hover:bg-campus-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {importMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Import CSV
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab('timetable')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'timetable' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Timetable
                </button>
                <button
                    onClick={() => setActiveTab('absences')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'absences' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <UserX className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Absences
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'timetable' && (
                <TimetableView sessions={sessions} isLoading={isLoading} roomCodes={roomCodes} roomColor={roomColor} />
            )}
            {activeTab === 'absences' && (
                <AbsenceView sessions={sessions} />
            )}
        </div>
    )
}

/* ────────────── TIMETABLE VIEW ────────────── */

function TimetableView({ sessions, isLoading, roomCodes, roomColor }: {
    sessions: Session[]; isLoading: boolean; roomCodes: string[]; roomColor: Record<string, string>
}) {
    return (
        <>
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-campus-500 animate-spin" />
                </div>
            )}

            {!isLoading && sessions.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No sessions scheduled yet</p>
                    <p className="text-xs text-gray-400">Import a CSV file to populate the schedule</p>
                </div>
            )}

            {!isLoading && sessions.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-gray-100">
                            <div className="p-3 text-xs font-medium text-gray-400" />
                            {DAYS.map(d => (
                                <div key={d} className="p-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                    {DAY_SHORT[d]}
                                </div>
                            ))}
                        </div>

                        {HOURS.map(hour => (
                            <div key={hour} className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-gray-50 min-h-[64px]">
                                <div className="p-2 text-[11px] font-medium text-gray-400 flex items-start justify-end pr-3 pt-2">
                                    {`${hour}:00`}
                                </div>
                                {DAYS.map(day => {
                                    const daySlots = getSessionsAtHour(sessions, day, hour)
                                    return (
                                        <div key={day} className="border-l border-gray-100 p-1 flex flex-col gap-1">
                                            {daySlots.map(s => (
                                                <div
                                                    key={s.id}
                                                    className={`rounded-lg border px-2 py-1.5 text-[10px] leading-tight ${roomColor[s.roomCode]}`}
                                                >
                                                    <p className="font-bold truncate">{s.courseName}</p>
                                                    <p className="opacity-70 truncate">{s.roomCode} · {s.teacherName}</p>
                                                    <p className="opacity-50">{s.startTime}–{s.endTime}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {roomCodes.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-gray-400">Rooms:</span>
                    {roomCodes.map(c => (
                        <span key={c} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${roomColor[c]}`}>{c}</span>
                    ))}
                </div>
            )}

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-500">
                <p className="font-semibold text-gray-700 mb-1">CSV Format</p>
                <code className="block bg-white px-3 py-2 rounded-lg border border-gray-200 font-mono text-[11px]">
                    room_code,course_name,teacher_name,day,time_range,group<br />
                    A1,Mathematics I,Dr. Martin,MONDAY,8:00-10:00,G1-CS
                </code>
            </div>
        </>
    )
}

/* ────────────── ABSENCE VIEW ────────────── */

function AbsenceView({ sessions }: { sessions: Session[] }) {
    const queryClient = useQueryClient()
    const [selectedSessionId, setSelectedSessionId] = useState<number | ''>('')
    const [absenceDate, setAbsenceDate] = useState('')
    const [reason, setReason] = useState('')
    const [expandedAbsenceId, setExpandedAbsenceId] = useState<number | null>(null)
    const [freeRooms, setFreeRooms] = useState<FreeRoom[]>([])
    const [freeLoading, setFreeLoading] = useState(false)

    const { data: absences = [], isLoading } = useQuery({
        queryKey: ['absences'],
        queryFn: fetchAbsences,
    })

    const createMut = useMutation({
        mutationFn: createAbsence,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['absences'] })
            setSelectedSessionId('')
            setAbsenceDate('')
            setReason('')
        },
    })

    const deleteMut = useMutation({
        mutationFn: deleteAbsence,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['absences'] }),
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSessionId || !absenceDate) return
        createMut.mutate({ sessionId: Number(selectedSessionId), absenceDate, reason })
    }

    const handleShowFreeRooms = async (absence: Absence) => {
        if (expandedAbsenceId === absence.id) {
            setExpandedAbsenceId(null)
            setFreeRooms([])
            return
        }
        setExpandedAbsenceId(absence.id)
        setFreeLoading(true)
        try {
            const rooms = await fetchFreeRooms(absence.dayOfWeek, absence.startTime, absence.endTime)
            setFreeRooms(rooms)
        } catch {
            setFreeRooms([])
        }
        setFreeLoading(false)
    }

    const selectedSession = sessions.find(s => s.id === Number(selectedSessionId))

    return (
        <div className="space-y-6">
            {/* Declare Absence Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-amber-600" />
                    Declare Teacher Absence
                </h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Session</label>
                        <select
                            value={selectedSessionId}
                            onChange={e => setSelectedSessionId(e.target.value ? Number(e.target.value) : '')}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-campus-300 focus:border-campus-400 bg-white"
                            required
                        >
                            <option value="">Select session…</option>
                            {sessions.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.courseName} — {s.teacherName} ({DAY_SHORT[s.dayOfWeek]} {s.startTime})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
                        <input
                            type="date"
                            value={absenceDate}
                            onChange={e => setAbsenceDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-campus-300 focus:border-campus-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason (optional)</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Sick leave"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-campus-300 focus:border-campus-400"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={createMut.isPending || !selectedSessionId || !absenceDate}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Declare
                        </button>
                    </div>
                </form>
                {selectedSession && (
                    <p className="text-[11px] text-gray-400 mt-2">
                        Selected: {selectedSession.courseName} in {selectedSession.roomCode}, {DAY_SHORT[selectedSession.dayOfWeek]} {selectedSession.startTime}–{selectedSession.endTime}
                    </p>
                )}
                {createMut.isError && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {(createMut.error as any)?.response?.data?.error || 'Failed to declare absence'}
                    </p>
                )}
            </div>

            {/* Absence List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-gray-900">Declared Absences</h3>
                    <span className="text-xs text-gray-400 ml-auto">{absences.length} total</span>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-campus-500 animate-spin" />
                    </div>
                )}

                {!isLoading && absences.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-400">
                        No absences declared yet
                    </div>
                )}

                {!isLoading && absences.length > 0 && (
                    <div className="divide-y divide-gray-100">
                        {absences.map((a: Absence) => (
                            <div key={a.id}>
                                <div className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-gray-900">{a.teacherName}</span>
                                            <span className="text-xs text-gray-400">·</span>
                                            <span className="text-xs text-gray-600">{a.courseName || 'N/A'}</span>
                                            <span className="text-xs text-gray-400">·</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                {DAY_SHORT[a.dayOfWeek]} {a.startTime}–{a.endTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400">{a.absenceDate}</span>
                                            {a.reason && <span className="text-xs text-gray-500">— {a.reason}</span>}
                                            {a.roomCode && <span className="text-[10px] font-mono text-gray-400">Room: {a.roomCode}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleShowFreeRooms(a)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-campus-700 bg-campus-50 border border-campus-200 rounded-lg hover:bg-campus-100 transition-colors"
                                        >
                                            <DoorOpen className="w-3 h-3" />
                                            Free Rooms
                                            {expandedAbsenceId === a.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                        </button>
                                        <button
                                            onClick={() => deleteMut.mutate(a.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete absence"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {/* Free room suggestions */}
                                {expandedAbsenceId === a.id && (
                                    <div className="px-5 pb-3">
                                        <div className="bg-campus-50 rounded-xl border border-campus-100 p-3">
                                            <p className="text-xs font-semibold text-campus-700 mb-2">
                                                Available rooms for {DAY_SHORT[a.dayOfWeek]} {a.startTime}–{a.endTime}:
                                            </p>
                                            {freeLoading && <Loader2 className="w-4 h-4 text-campus-500 animate-spin" />}
                                            {!freeLoading && freeRooms.length === 0 && (
                                                <p className="text-xs text-gray-500">No free rooms found for this slot.</p>
                                            )}
                                            {!freeLoading && freeRooms.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {freeRooms.map((r: FreeRoom) => (
                                                        <div key={r.roomId} className="bg-white rounded-lg border border-campus-200 px-3 py-2 flex items-center gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-campus-500 flex-shrink-0" />
                                                            <div>
                                                                <span className="text-xs font-bold text-gray-900">{r.roomCode}</span>
                                                                <span className="text-[10px] text-gray-500 ml-1">{r.roomType} · {r.capacity} seats</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/* ────────────── HELPERS ────────────── */

function getSessionsAtHour(sessions: Session[], day: DayOfWeek, hour: number): Session[] {
    return sessions.filter(s => {
        if (s.dayOfWeek !== day) return false
        const startH = parseInt(s.startTime.split(':')[0])
        return startH === hour
    })
}

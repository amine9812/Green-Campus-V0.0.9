// Room-related TypeScript types matching backend DTOs

export type RoomType = 'CLASS' | 'LAB' | 'AMPHI'
export type RoomStatus = 'OPEN' | 'CLOSED'
export type AssetStatus = 'WORKING' | 'BROKEN'
export type AssetType = 'PROJECTOR' | 'TEACHER_PC' | 'TABLE_PC'

export interface RoomListItem {
    id: number
    code: string
    type: RoomType
    capacity: number
    status: RoomStatus
    totalTables: number
    tablesHavePcs: boolean
    notes: string | null
    totalPcs: number
    workingPcs: number
    brokenPcs: number
    hasProjector: boolean
    projectorStatus: AssetStatus | null
    teacherPcStatus: AssetStatus | null
    healthScore: number
    occupancyStatus: 'IDLE' | 'OCCUPIED' | 'CLOSED'
}

export interface AssetItem {
    id: number
    type: AssetType
    label: string
    status: AssetStatus
    tableIndex: number | null
}

export interface RoomDetail extends RoomListItem {
    assets: AssetItem[]
}

export interface RoomSearchParams {
    q?: string
    type?: RoomType
    status?: RoomStatus
    minWorkingPcs?: number
    needsProjector?: boolean
}

export interface RoomCreatePayload {
    code: string
    type: RoomType
    capacity: number
    status: RoomStatus
    totalTables: number
    tablesHavePcs: boolean
    notes: string
    projectorStatus?: AssetStatus
    teacherPcStatus?: AssetStatus
}

// ---------- Tickets ----------
export type TicketPriority = 'P1' | 'P2' | 'P3'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface Ticket {
    id: number
    roomId: number
    roomCode: string
    title: string
    description: string | null
    priority: TicketPriority
    status: TicketStatus
    createdAt: string
    updatedAt: string
}

export interface TicketCreatePayload {
    roomId: number
    title: string
    description: string
    priority: TicketPriority
}

// ---------- Sessions ----------
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface Session {
    id: number
    roomId: number
    roomCode: string
    courseName: string
    teacherName: string
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
    groupName: string
}

// ---------- Absences ----------
export interface Absence {
    id: number
    teacherName: string
    absenceDate: string
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
    reason: string | null
    sessionId: number | null
    courseName: string | null
    roomCode: string | null
}

export interface FreeRoom {
    roomId: number
    roomCode: string
    roomType: string
    capacity: number
    reason: string
}


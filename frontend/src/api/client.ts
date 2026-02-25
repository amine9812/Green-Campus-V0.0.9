import axios from 'axios'
import type {
    RoomListItem, RoomDetail, RoomSearchParams, RoomCreatePayload,
    AssetItem, AssetStatus, Ticket, TicketCreatePayload, TicketPriority, TicketStatus,
    Session, Absence, FreeRoom, DayOfWeek
} from '../types/room'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor: attach JWT if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gc_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api

// ---------- Health ----------
export const fetchHealth = async (): Promise<{ status: string }> => {
    const { data } = await api.get('/health')
    return data
}

// ---------- Rooms ----------
export const fetchRooms = async (params?: RoomSearchParams): Promise<RoomListItem[]> => {
    const { data } = await api.get('/rooms', { params })
    return data
}

export const fetchRoomById = async (id: number): Promise<RoomDetail> => {
    const { data } = await api.get(`/rooms/${id}`)
    return data
}

export const createRoom = async (payload: RoomCreatePayload): Promise<RoomDetail> => {
    const { data } = await api.post('/rooms', payload)
    return data
}

export const updateRoom = async (id: number, payload: RoomCreatePayload): Promise<RoomDetail> => {
    const { data } = await api.put(`/rooms/${id}`, payload)
    return data
}

export const deleteRoom = async (id: number): Promise<void> => {
    await api.delete(`/rooms/${id}`)
}

// ---------- Assets ----------
export const updateAssetStatus = async (assetId: number, status: AssetStatus): Promise<AssetItem> => {
    const { data } = await api.patch(`/assets/${assetId}/status`, { status })
    return data
}

// ---------- Tickets ----------
export const fetchTickets = async (params?: {
    status?: TicketStatus
    priority?: TicketPriority
    roomId?: number
}): Promise<Ticket[]> => {
    const { data } = await api.get('/tickets', { params })
    return data
}

export const createTicket = async (payload: TicketCreatePayload): Promise<Ticket> => {
    const { data } = await api.post('/tickets', payload)
    return data
}

export const updateTicketStatus = async (id: number, status: TicketStatus): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/${id}/status`, { status })
    return data
}

export const deleteTicket = async (id: number): Promise<void> => {
    await api.delete(`/tickets/${id}`)
}

// ---------- Sessions ----------
export const fetchSessions = async (): Promise<Session[]> => {
    const { data } = await api.get('/sessions')
    return data
}

export const fetchSessionsByRoom = async (roomId: number): Promise<Session[]> => {
    const { data } = await api.get(`/sessions/room/${roomId}`)
    return data
}

export const importSessionsCsv = async (file: File): Promise<{ imported: number }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/sessions/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

export const clearRoomSessions = async (roomId: number): Promise<void> => {
    await api.delete(`/sessions/room/${roomId}`)
}

// ---------- Absences ----------
export const fetchAbsences = async (): Promise<Absence[]> => {
    const { data } = await api.get('/absences')
    return data
}

export const createAbsence = async (payload: { sessionId: number; absenceDate: string; reason: string }): Promise<Absence> => {
    const { data } = await api.post('/absences', payload)
    return data
}

export const deleteAbsence = async (id: number): Promise<void> => {
    await api.delete(`/absences/${id}`)
}

export const fetchFreeRooms = async (day: DayOfWeek, start: string, end: string): Promise<FreeRoom[]> => {
    const { data } = await api.get('/absences/free-rooms', { params: { day, start, end } })
    return data
}

// ---------- Auth ----------
export const login = async (username: string, password: string): Promise<{ token: string; role: string; displayName: string }> => {
    const { data } = await api.post('/auth/login', { username, password })
    return data
}

// ---------- Stats ----------
export const fetchStats = async (): Promise<{ totalRooms: number; openTickets: number; brokenPcs: number; totalSessions: number }> => {
    const { data } = await api.get('/stats')
    return data
}

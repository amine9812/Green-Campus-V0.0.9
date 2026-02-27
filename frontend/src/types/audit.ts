export interface AuditLogEntry {
    id: number
    eventTimestamp: string
    actorUserId: number | null
    actorUsername: string
    actorRole: string
    actionType: string
    entityType: string
    entityId: number | null
    summary: string | null
    beforeJson: string | null
    afterJson: string | null
}

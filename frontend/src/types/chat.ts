export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
    id: string
    role: ChatRole
    content: string
    timestamp: string
}

export interface ChatRequest {
    message: string
}

export interface ChatResponse {
    answer: string
    conversationId?: string
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, MessageCircle, RotateCcw, Send, Trash2, X } from 'lucide-react'
import { sendChatMessage } from '../api/client'
import type { ChatMessage } from '../types/chat'

const STORAGE_KEY = 'gc_chat_history_v1'
const MAX_HISTORY = 20

function uid() {
    return Math.random().toString(36).slice(2, 10)
}

function loadHistory(): ChatMessage[] {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw) as ChatMessage[]
        if (!Array.isArray(parsed)) return []
        return parsed.slice(-MAX_HISTORY)
    } catch {
        return []
    }
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory())
    const [isLoading, setIsLoading] = useState(false)
    const [lastError, setLastError] = useState<string | null>(null)
    const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)
    const listRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)))
    }, [messages])

    useEffect(() => {
        if (!listRef.current) return
        listRef.current.scrollTop = listRef.current.scrollHeight
    }, [messages, isLoading])

    const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading])

    const appendMessage = (role: ChatMessage['role'], content: string) => {
        setMessages((prev) => [...prev, { id: uid(), role, content, timestamp: new Date().toISOString() }].slice(-MAX_HISTORY))
    }

    const parseErrorMessage = (error: unknown) => {
        const status = (error as { response?: { status?: number; data?: { error?: string } } })?.response?.status
        const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error

        if (status === 400) return message || 'Invalid question. Keep it under 500 characters.'
        if (status === 401) return 'You are not authenticated. Please sign in again.'
        if (status === 429) return 'Too many requests. Please wait a minute and retry.'
        return message || 'Assistant is currently unavailable. Please retry.'
    }

    const ask = async (question: string) => {
        const trimmed = question.trim()
        if (!trimmed) return

        setLastError(null)
        setLastUserMessage(trimmed)
        appendMessage('user', trimmed)
        setInput('')
        setIsLoading(true)

        try {
            const response = await sendChatMessage({ message: trimmed })
            appendMessage('assistant', response.answer)
        } catch (error) {
            setLastError(parseErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await ask(input)
    }

    const onRetry = async () => {
        if (!lastUserMessage || isLoading) return
        setLastError(null)
        setIsLoading(true)
        try {
            const response = await sendChatMessage({ message: lastUserMessage })
            appendMessage('assistant', response.answer)
        } catch (error) {
            setLastError(parseErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const clearChat = () => {
        setMessages([])
        setLastError(null)
        setLastUserMessage(null)
        sessionStorage.removeItem(STORAGE_KEY)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-campus-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-campus-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-campus-100 p-2 text-campus-700">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Assistant IA</p>
                                <p className="text-xs text-gray-500">GreenCampus internal assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded p-1 text-gray-500 hover:bg-gray-100"
                            aria-label="Close chat"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div ref={listRef} className="h-80 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/60">
                        {messages.length === 0 && (
                            <div className="rounded-lg border border-dashed border-campus-200 bg-white p-3 text-xs text-gray-600">
                                Ask about rooms, equipment status, tickets, or availability.
                            </div>
                        )}

                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user'
                                            ? 'bg-campus-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-900'
                                        }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="text-xs text-gray-500">Assistant is thinking...</div>
                        )}
                    </div>

                    {lastError && (
                        <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            <div className="flex items-center justify-between gap-2">
                                <span>{lastError}</span>
                                <button
                                    onClick={onRetry}
                                    className="inline-flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-red-700 hover:bg-red-100"
                                >
                                    <RotateCcw className="h-3 w-3" /> Retry
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="border-t border-campus-100 p-3">
                        <div className="flex items-center gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-200"
                                maxLength={500}
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-campus-600 text-white disabled:opacity-50"
                                aria-label="Send message"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={clearChat}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100"
                                aria-label="Clear chat"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-campus-600 text-white shadow-lg hover:bg-campus-700"
                onClick={() => setIsOpen((v) => !v)}
                aria-label="Toggle assistant"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>
        </div>
    )
}

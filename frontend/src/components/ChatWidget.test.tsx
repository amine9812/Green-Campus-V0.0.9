import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChatWidget from './ChatWidget'
import { sendChatMessage } from '../api/client'

vi.mock('../api/client', () => ({
    sendChatMessage: vi.fn(),
}))

const mockedSend = vi.mocked(sendChatMessage)

describe('ChatWidget', () => {
    beforeEach(() => {
        sessionStorage.clear()
        mockedSend.mockReset()
    })

    it('opens and closes panel', async () => {
        const user = userEvent.setup()
        render(<ChatWidget />)

        expect(screen.queryByText('Assistant IA')).not.toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /toggle assistant/i }))
        expect(screen.getByText('Assistant IA')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /close chat/i }))
        expect(screen.queryByText('Assistant IA')).not.toBeInTheDocument()
    })

    it('sends message and renders reply', async () => {
        const user = userEvent.setup()
        mockedSend.mockResolvedValue({ answer: 'Room A1 is OPEN.' })
        render(<ChatWidget />)

        await user.click(screen.getByRole('button', { name: /toggle assistant/i }))
        await user.type(screen.getByPlaceholderText(/ask a question/i), 'status A1')
        await user.click(screen.getByRole('button', { name: /send message/i }))

        await waitFor(() => expect(screen.getByText('Room A1 is OPEN.')).toBeInTheDocument())
    })

    it('shows error and retries', async () => {
        const user = userEvent.setup()
        mockedSend
            .mockRejectedValueOnce({ response: { status: 500, data: { error: 'boom' } } })
            .mockResolvedValueOnce({ answer: 'Information not available in the system.' })

        render(<ChatWidget />)
        await user.click(screen.getByRole('button', { name: /toggle assistant/i }))
        await user.type(screen.getByPlaceholderText(/ask a question/i), 'hello')
        await user.click(screen.getByRole('button', { name: /send message/i }))

        await waitFor(() => expect(screen.getByText(/boom/i)).toBeInTheDocument())
        await user.click(screen.getByRole('button', { name: /retry/i }))
        await waitFor(() => expect(screen.getByText('Information not available in the system.')).toBeInTheDocument())
    })

    it('clears chat history', async () => {
        const user = userEvent.setup()
        mockedSend.mockResolvedValue({ answer: 'ok' })
        render(<ChatWidget />)

        await user.click(screen.getByRole('button', { name: /toggle assistant/i }))
        await user.type(screen.getByPlaceholderText(/ask a question/i), 'hello')
        await user.click(screen.getByRole('button', { name: /send message/i }))
        await waitFor(() => expect(screen.getByText('ok')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /clear chat/i }))
        expect(screen.queryByText('ok')).not.toBeInTheDocument()
        expect(sessionStorage.getItem('gc_chat_history_v1')).toBe('[]')
    })
})

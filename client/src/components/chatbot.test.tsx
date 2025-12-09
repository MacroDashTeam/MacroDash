import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { Chatbot } from './chatbot'

global.fetch = vi.fn()

describe('Chatbot', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ response: '' }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = render(<Chatbot symbol="AAPL" />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = render(<Chatbot symbol="AAPL" />)
        expect(container).toMatchSnapshot()
    })
})

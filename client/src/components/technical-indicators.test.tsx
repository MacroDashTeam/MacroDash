import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { TechnicalIndicators } from './technical-indicators'

global.fetch = vi.fn()

describe('TechnicalIndicators', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ indicators: {} }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = render(<TechnicalIndicators symbol="AAPL" />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = render(<TechnicalIndicators symbol="AAPL" />)
        expect(container).toMatchSnapshot()
    })
})

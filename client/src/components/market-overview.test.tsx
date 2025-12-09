import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import MarketOverview from './market-overview'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('MarketOverview', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<MarketOverview />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<MarketOverview />)
        expect(container).toMatchSnapshot()
    })
})

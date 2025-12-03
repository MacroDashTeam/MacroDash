import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import MarketSectors from './market-sectors'

global.fetch = vi.fn()

describe('MarketSectors', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<MarketSectors />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<MarketSectors />)
        expect(container).toMatchSnapshot()
    })
})

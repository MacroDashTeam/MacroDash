import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import StockTopLosers from './stock-top-losers'

global.fetch = vi.fn()

describe('StockTopLosers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ losers: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<StockTopLosers />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<StockTopLosers />)
        expect(container).toMatchSnapshot()
    })
})

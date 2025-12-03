import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import StockDetail from './stock-detail'

global.fetch = vi.fn()

describe('StockDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ data: {} }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<StockDetail symbol="AAPL" />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<StockDetail symbol="AAPL" />)
        expect(container).toMatchSnapshot()
    })
})

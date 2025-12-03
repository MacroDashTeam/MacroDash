import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import Watchlist from './watchlist'

global.fetch = vi.fn()

describe('Watchlist', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ watchlist: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<Watchlist />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<Watchlist />)
        expect(container).toMatchSnapshot()
    })
})

import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import CryptoWatchlist from './crypto-watchlist'

global.fetch = vi.fn()

describe('CryptoWatchlist', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ watchlist: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<CryptoWatchlist />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<CryptoWatchlist />)
        expect(container).toMatchSnapshot()
    })
})

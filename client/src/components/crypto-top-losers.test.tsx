import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import CryptoTopLosers from './crypto-top-losers'

global.fetch = vi.fn()

describe('CryptoTopLosers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ losers: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<CryptoTopLosers />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<CryptoTopLosers />)
        expect(container).toMatchSnapshot()
    })
})

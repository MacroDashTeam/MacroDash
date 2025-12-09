import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import CryptoDetail from './crypto-detail'

global.fetch = vi.fn()

describe('CryptoDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ data: {} }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<CryptoDetail symbol="BTC" />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<CryptoDetail symbol="BTC" />)
        expect(container).toMatchSnapshot()
    })
})

import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import CryptoDashboard from './crypto-dashboard'

global.fetch = vi.fn()

describe('CryptoDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<CryptoDashboard />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<CryptoDashboard />)
        expect(container).toMatchSnapshot()
    })
})

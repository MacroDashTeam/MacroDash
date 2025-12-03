import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import EconomicIndicators from './economic-indicators'

global.fetch = vi.fn()

describe('EconomicIndicators', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<EconomicIndicators />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<EconomicIndicators />)
        expect(container).toMatchSnapshot()
    })
})

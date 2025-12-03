import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import CommoditiesOverview from './commodities-overview'

global.fetch = vi.fn()

describe('CommoditiesOverview', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<CommoditiesOverview />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<CommoditiesOverview />)
        expect(container).toMatchSnapshot()
    })
})

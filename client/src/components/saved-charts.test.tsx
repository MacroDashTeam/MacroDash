import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import SavedCharts from './saved-charts'

global.fetch = vi.fn()

describe('SavedCharts', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ charts: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<SavedCharts />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<SavedCharts />)
        expect(container).toMatchSnapshot()
    })
})

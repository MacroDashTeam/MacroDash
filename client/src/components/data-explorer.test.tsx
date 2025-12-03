import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import DataExplorer from './data-explorer'

global.fetch = vi.fn()

describe('DataExplorer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<DataExplorer />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<DataExplorer />)
        expect(container).toMatchSnapshot()
    })
})

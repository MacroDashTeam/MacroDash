import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import DataExplorerOld from './data-explorer-old'

global.fetch = vi.fn()

describe('DataExplorerOld', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<DataExplorerOld />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<DataExplorerOld />)
        expect(container).toMatchSnapshot()
    })
})

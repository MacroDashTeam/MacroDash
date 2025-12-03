import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import TopGainers from './top-gainers'

global.fetch = vi.fn()

describe('TopGainers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ gainers: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<TopGainers />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<TopGainers />)
        expect(container).toMatchSnapshot()
    })
})

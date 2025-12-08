import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import ManageDisplay from './manage-display'
import { BrowserRouter } from 'react-router'

global.fetch = vi.fn()

describe('ManageDisplay', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ displays: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<BrowserRouter><ManageDisplay /></BrowserRouter>);
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<BrowserRouter><ManageDisplay /></BrowserRouter>)
        expect(container).toMatchSnapshot()
    })
})

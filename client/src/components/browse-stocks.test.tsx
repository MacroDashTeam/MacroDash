import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import BrowseStocks from './browse-stocks'
import { BrowserRouter } from 'react-router'

global.fetch = vi.fn()

describe('BrowseStocks', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ stocks: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<BrowserRouter><BrowseStocks /></BrowserRouter>)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<BrowserRouter><BrowseStocks /></BrowserRouter>)
        expect(container).toMatchSnapshot()
    })
})

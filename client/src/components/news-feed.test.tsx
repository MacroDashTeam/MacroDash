import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import NewsFeed from './news-feed'

global.fetch = vi.fn()

describe('NewsFeed', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ articles: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<NewsFeed />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<NewsFeed />)
        expect(container).toMatchSnapshot()
    })
})

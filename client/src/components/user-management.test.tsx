import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import UserManagement from './user-management'

global.fetch = vi.fn()

describe('UserManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ users: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<UserManagement />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<UserManagement />)
        expect(container).toMatchSnapshot()
    })
})

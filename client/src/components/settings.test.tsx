import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Settings from './settings'

global.fetch = vi.fn()

describe('Settings', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ settings: {} }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = render(<Settings />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = render(<Settings />)
        expect(container).toMatchSnapshot()
    })
})

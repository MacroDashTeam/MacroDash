import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import CustomAnalysis from './custom-analysis'

global.fetch = vi.fn()

describe('CustomAnalysis', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ data: {} }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = render(<CustomAnalysis />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = render(<CustomAnalysis />)
        expect(container).toMatchSnapshot()
    })
})

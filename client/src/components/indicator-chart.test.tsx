import { describe, it, expect, vi } from 'vitest'
import { renderWithQueryClient } from '../test-utils'
import IndicatorChart from './indicator-chart'

global.fetch = vi.fn()

describe('IndicatorChart', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        } as Response)
    })

    it('renders without crashing', () => {
        const { container } = renderWithQueryClient(<IndicatorChart indicator="GDP" />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderWithQueryClient(<IndicatorChart indicator="GDP" />)
        expect(container).toMatchSnapshot()
    })
})

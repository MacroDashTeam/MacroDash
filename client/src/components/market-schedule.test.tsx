import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import MarketSchedule from './market-schedule'

global.fetch = vi.fn()

describe('MarketSchedule', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()

        vi.setSystemTime(new Date('2023-01-01T12:00:00Z'))

        vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00')

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it('renders without crashing', () => {
        const { container } = render(<MarketSchedule />)
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = render(<MarketSchedule />)
        expect(container).toMatchSnapshot()
    })
})

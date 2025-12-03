import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import MarketSchedule from './market-schedule'

global.fetch = vi.fn()

describe('MarketSchedule', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2023-01-01T12:00:00Z'))

        // Force all date formatting to UTC to stabilize snapshots
        vi.stubGlobal('Intl', {
            DateTimeFormat: class extends Intl.DateTimeFormat {
                constructor(locale: string, options: any = {}) {
                    super(locale, { ...options, timeZone: 'UTC' })
                }
            }
        })

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response)
    })

    afterEach(() => {
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

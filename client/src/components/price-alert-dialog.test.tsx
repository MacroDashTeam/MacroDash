import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { PriceAlertDialog } from './price-alert-dialog'

global.fetch = vi.fn()

describe('PriceAlertDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without crashing', () => {
        const { container } = render(
            <PriceAlertDialog
                open={true}
                onOpenChange={vi.fn()}
                symbol="AAPL"
                stockName="Apple Inc."
                currentPrice={150}
            />
        )
        expect(container).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = render(
            <PriceAlertDialog
                open={true}
                onOpenChange={vi.fn()}
                symbol="AAPL"
                stockName="Apple Inc."
                currentPrice={150}
            />
        )
        expect(container).toMatchSnapshot()
    })
})

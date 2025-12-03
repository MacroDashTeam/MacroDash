import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GoogleSvg from './google-svg'

describe('GoogleSvg', () => {
    it('renders without crashing', () => {
        const { container } = render(<GoogleSvg />)
        expect(container).toBeInTheDocument()
    })

    it('renders an SVG element', () => {
        const { container } = render(<GoogleSvg />)
        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('has correct viewBox attribute', () => {
        const { container } = render(<GoogleSvg />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('contains all four color paths for Google logo', () => {
        const { container } = render(<GoogleSvg />)
        const paths = container.querySelectorAll('path')
        expect(paths).toHaveLength(4)
    })

    it('matches snapshot', () => {
        const { container } = render(<GoogleSvg />)
        expect(container.firstChild).toMatchSnapshot()
    })
})

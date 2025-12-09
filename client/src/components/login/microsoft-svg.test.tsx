import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MicrosoftSvg from './microsoft-svg'

describe('MicrosoftSvg', () => {
    it('renders without crashing', () => {
        const { container } = render(<MicrosoftSvg />)
        expect(container).toBeInTheDocument()
    })

    it('renders an SVG element', () => {
        const { container } = render(<MicrosoftSvg />)
        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('has correct viewBox attribute', () => {
        const { container } = render(<MicrosoftSvg />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('contains all four color paths for Microsoft logo', () => {
        const { container } = render(<MicrosoftSvg />)
        const paths = container.querySelectorAll('path')
        expect(paths).toHaveLength(4)
    })

    it('has correct colors for Microsoft logo quadrants', () => {
        const { container } = render(<MicrosoftSvg />)
        const paths = container.querySelectorAll('path')

        expect(paths[0]).toHaveAttribute('fill', '#f25022') // Red
        expect(paths[1]).toHaveAttribute('fill', '#00a4ef') // Blue
        expect(paths[2]).toHaveAttribute('fill', '#7fba00') // Green
        expect(paths[3]).toHaveAttribute('fill', '#ffb900') // Yellow
    })

    it('matches snapshot', () => {
        const { container } = render(<MicrosoftSvg />)
        expect(container.firstChild).toMatchSnapshot()
    })
})

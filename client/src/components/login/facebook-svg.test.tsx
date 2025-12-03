import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FacebookSvg from './facebook-svg'

describe('FacebookSvg', () => {
    it('renders without crashing', () => {
        const { container } = render(<FacebookSvg />)
        expect(container).toBeInTheDocument()
    })

    it('renders an SVG element', () => {
        const { container } = render(<FacebookSvg />)
        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('has correct viewBox attribute', () => {
        const { container } = render(<FacebookSvg />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('has correct fill attribute', () => {
        const { container } = render(<FacebookSvg />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('fill', 'currentColor')
    })

    it('contains Facebook logo path', () => {
        const { container } = render(<FacebookSvg />)
        const path = container.querySelector('path')
        expect(path).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = render(<FacebookSvg />)
        expect(container.firstChild).toMatchSnapshot()
    })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ThemeProvider from './theme-provider'

describe('ThemeProvider', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear()
        vi.clearAllMocks()
        // Reset document classes
        document.documentElement.className = ''
    })

    it('renders children without crashing', () => {
        render(
            <ThemeProvider>
                <div data-testid="child">Test Child</div>
            </ThemeProvider>
        )
        expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('uses default theme when no stored theme exists', () => {
        render(
            <ThemeProvider>
                <div>Content</div>
            </ThemeProvider>
        )
        // Default theme is "system", which should add either "light" or "dark" class
        const hasThemeClass = document.documentElement.classList.contains('light') ||
            document.documentElement.classList.contains('dark')
        expect(hasThemeClass).toBe(true)
    })

    it('uses custom default theme', () => {
        render(
            <ThemeProvider defaultTheme="dark">
                <div>Content</div>
            </ThemeProvider>
        )
        expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('applies light theme correctly', () => {
        render(
            <ThemeProvider defaultTheme="light">
                <div>Content</div>
            </ThemeProvider>
        )
        expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    it('applies dark theme correctly', () => {
        render(
            <ThemeProvider defaultTheme="dark">
                <div>Content</div>
            </ThemeProvider>
        )
        expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('uses custom storage key', () => {
        const customKey = 'custom-theme-key'
        render(
            <ThemeProvider storageKey={customKey} defaultTheme="dark">
                <div>Content</div>
            </ThemeProvider>
        )
        // The component should try to read from the custom key
        expect(localStorage.getItem).toHaveBeenCalledWith(customKey)
    })

    it('handles localStorage errors gracefully', () => {
        // Mock localStorage.getItem to throw an error
        vi.mocked(localStorage.getItem).mockImplementation(() => {
            throw new Error('Storage error')
        })

        render(
            <ThemeProvider defaultTheme="light">
                <div>Content</div>
            </ThemeProvider>
        )

        // Should fall back to default theme
        expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    it('removes previous theme classes when theme changes', () => {
        document.documentElement.classList.add('light')

        render(
            <ThemeProvider defaultTheme="dark">
                <div>Content</div>
            </ThemeProvider>
        )

        expect(document.documentElement.classList.contains('light')).toBe(false)
        expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('matches snapshot', () => {
        const { container } = render(
            <ThemeProvider>
                <div>Test Content</div>
            </ThemeProvider>
        )
        expect(container).toMatchSnapshot()
    })
})

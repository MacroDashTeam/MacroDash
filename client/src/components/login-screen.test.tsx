import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginScreen from './login-screen'

describe('LoginScreen', () => {
    const mockOnLogin = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without crashing', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        expect(screen.getByText('Welcome to MacroDash')).toBeInTheDocument()
    })

    it('displays the MacroDash logo', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        const logo = screen.getByAltText('MacroDash Logo')
        expect(logo).toBeInTheDocument()
    })

    it('displays welcome message and description', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        expect(screen.getByText('Welcome to MacroDash')).toBeInTheDocument()
        expect(screen.getByText('Sign in to access your macroeconomic dashboard')).toBeInTheDocument()
    })

    it('renders email input field', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        const emailInput = screen.getByLabelText('Email')
        expect(emailInput).toBeInTheDocument()
        expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('renders password input field', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        const passwordInput = screen.getByLabelText('Password')
        expect(passwordInput).toBeInTheDocument()
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('renders sign in button', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('updates email input value when typing', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        expect(emailInput.value).toBe('test@example.com')
    })

    it('updates password input value when typing', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(passwordInput.value).toBe('password123')
    })

    it('calls onLogin with email and password when form is submitted', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Sign In' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        expect(mockOnLogin).toHaveBeenCalledTimes(1)
        expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('displays loading state when isLoading is true', () => {
        render(<LoginScreen onLogin={mockOnLogin} isLoading={true} />)
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })

    it('disables submit button when isLoading is true', () => {
        render(<LoginScreen onLogin={mockOnLogin} isLoading={true} />)
        const submitButton = screen.getByRole('button', { name: 'Signing in...' })
        expect(submitButton).toBeDisabled()
    })

    it('displays error message when error prop is provided', () => {
        const errorMessage = 'Invalid credentials'
        render(<LoginScreen onLogin={mockOnLogin} error={errorMessage} />)
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('does not display error message when error prop is not provided', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        const errorElements = screen.queryByText(/Invalid/)
        expect(errorElements).not.toBeInTheDocument()
    })

    it('displays sign up link', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
        expect(screen.getByText('Sign up')).toBeInTheDocument()
    })

    it('prevents default form submission', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)

        const form = screen.getByRole('button', { name: 'Sign In' }).closest('form')!
        const preventDefaultSpy = vi.fn()

        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
        submitEvent.preventDefault = preventDefaultSpy

        form.dispatchEvent(submitEvent)

        expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('has required attribute on email input', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        const emailInput = screen.getByLabelText('Email')
        expect(emailInput).toBeRequired()
    })

    it('has required attribute on password input', () => {
        render(<LoginScreen onLogin={mockOnLogin} />)
        const passwordInput = screen.getByLabelText('Password')
        expect(passwordInput).toBeRequired()
    })

    it('matches snapshot in default state', () => {
        const { container } = render(<LoginScreen onLogin={mockOnLogin} />)
        expect(container).toMatchSnapshot()
    })

    it('matches snapshot in loading state', () => {
        const { container } = render(<LoginScreen onLogin={mockOnLogin} isLoading={true} />)
        expect(container).toMatchSnapshot()
    })

    it('matches snapshot with error', () => {
        const { container } = render(<LoginScreen onLogin={mockOnLogin} error="Test error" />)
        expect(container).toMatchSnapshot()
    })
})

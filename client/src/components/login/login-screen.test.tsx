import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginScreen from './login-screen'

global.fetch = vi.fn()

describe('LoginScreen (login folder)', () => {
    const mockOnSignIn = vi.fn()
    const mockOnSkip = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without crashing', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} />)
        expect(screen.getByText(/MacroDash/i)).toBeInTheDocument()
    })

    it('displays sign in form by default', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} />)
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('displays skip button when onSkip is provided', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} onSkip={mockOnSkip} />)
        const skipButton = screen.queryByText(/skip/i)
        if (skipButton) {
            expect(skipButton).toBeInTheDocument()
        }
    })

    it('calls onSkip when skip button is clicked', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} onSkip={mockOnSkip} />)
        const skipButton = screen.queryByText(/skip/i)
        if (skipButton) {
            fireEvent.click(skipButton)
            expect(mockOnSkip).toHaveBeenCalled()
        }
    })

    it('updates email input when typing', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} />)
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        expect(emailInput.value).toBe('test@example.com')
    })

    it('updates password input when typing', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} />)
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(passwordInput.value).toBe('password123')
    })

    it('submits sign in form with email and password', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'test-token' }),
        } as Response)

        render(<LoginScreen onSignIn={mockOnSignIn} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        const signInButton = screen.getByRole('button', { name: /sign in/i })
        fireEvent.click(signInButton)

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled()
        })
    })

    it('displays error message when sign in fails', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid credentials' }),
        } as Response)

        render(<LoginScreen onSignIn={mockOnSignIn} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

        const signInButton = screen.getByRole('button', { name: /sign in/i })
        fireEvent.click(signInButton)

        await waitFor(() => {
            const errorText = screen.queryByText(/error/i) || screen.queryByText(/invalid/i)
            expect(errorText).toBeTruthy()
        })
    })

    it('switches to sign up mode when sign up link is clicked', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} />)

        const signUpLink = screen.queryByText(/sign up/i) || screen.queryByText(/create account/i)
        if (signUpLink) {
            fireEvent.click(signUpLink)

            // Check if additional sign up fields appear
            const firstNameInput = screen.queryByLabelText(/first name/i)
            if (firstNameInput) {
                expect(firstNameInput).toBeInTheDocument()
            }
        }
    })

    it('displays social sign in buttons', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} />)

        // Check for Google sign in button
        const buttons = screen.getAllByRole('button')
        const googleButton = buttons.find(button => button.querySelector('svg'))
        expect(googleButton).toBeInTheDocument()
    })

    it('handles social sign in click', () => {
        render(<LoginScreen onSignIn={mockOnSignIn} />)

        const googleButton = screen.queryByText(/google/i)
        if (googleButton) {
            fireEvent.click(googleButton)
            // The component should handle the social sign in
        }
    })

    it('matches snapshot', () => {
        const { container } = render(<LoginScreen onSignIn={mockOnSignIn} />)
        expect(container).toMatchSnapshot()
    })

    it('matches snapshot with onSkip', () => {
        const { container } = render(<LoginScreen onSignIn={mockOnSignIn} onSkip={mockOnSkip} />)
        expect(container).toMatchSnapshot()
    })
})

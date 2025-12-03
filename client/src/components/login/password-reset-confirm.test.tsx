import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import PasswordResetConfirm from './password-reset-confirm'

// ---- Stable environment stub ----
vi.stubGlobal('import', {
    meta: {
        env: {
            VITE_API_BASE_URL: ''
        }
    }
})

// ---- Global fetch mock ----
global.fetch = vi.fn()

describe('PasswordResetConfirm', () => {
    const mockOnSuccess = vi.fn()
    const mockUid = 'test-uid'
    const mockToken = 'test-token'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without crashing', () => {
        render(<PasswordResetConfirm uid={mockUid} token={mockToken} onSuccess={mockOnSuccess} />)
        expect(screen.getByText(/Reset password/i)).toBeInTheDocument();
        expect(screen.getByText(/By continuing, you agree to our Terms of Service and Privacy Policy/i)).toBeInTheDocument()
    })

    it('displays password input fields', () => {
        render(<PasswordResetConfirm uid={mockUid} token={mockToken} onSuccess={mockOnSuccess} />)

        const inputs = screen.getAllByLabelText(/password/i)
        expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('updates password input value when typing', () => {
        render(<PasswordResetConfirm uid={mockUid} token={mockToken} onSuccess={mockOnSuccess} />)

        const [newPassword] = screen.getAllByLabelText(/password/i) as HTMLInputElement[]

        fireEvent.change(newPassword, { target: { value: 'newPassword123!' } })

        expect(newPassword.value).toBe('newPassword123!')
    })

    it('shows validation error when passwords do not match', async () => {
        render(<PasswordResetConfirm uid={mockUid} token={mockToken} onSuccess={mockOnSuccess} />)

        const [newPassword, confirmPassword] = screen.getAllByLabelText(/password/i)

        fireEvent.change(newPassword, { target: { value: 'password123!' } })
        fireEvent.change(confirmPassword, { target: { value: 'differentPassword!' } })

        fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

        expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument()
    })

    it('calls API with correct data when form is submitted', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Password reset successful' }),
        } as Response)

        render(<PasswordResetConfirm uid={mockUid} token={mockToken} onSuccess={mockOnSuccess} />)

        const [newPassword, confirmPassword] = screen.getAllByLabelText(/password/i)

        fireEvent.change(newPassword, { target: { value: 'newPassword123!' } })
        fireEvent.change(confirmPassword, { target: { value: 'newPassword123!' } })

        fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

        expect(fetch).toHaveBeenCalled()
    })


    it('displays error message when API call fails', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid token' }),
        } as Response)

        render(<PasswordResetConfirm uid={mockUid} token={mockToken} onSuccess={mockOnSuccess} />)

        const [newPassword, confirmPassword] = screen.getAllByLabelText(/password/i)

        fireEvent.change(newPassword, { target: { value: 'newPassword123!' } })
        fireEvent.change(confirmPassword, { target: { value: 'newPassword123!' } })

        fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

        expect(await screen.findByText(/Invalid token/i)).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = render(
            <PasswordResetConfirm uid={mockUid} token={mockToken} onSuccess={mockOnSuccess} />
        )
        expect(container).toMatchSnapshot()
    })
})

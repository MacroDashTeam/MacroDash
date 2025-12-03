import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AppHeader from './app-header'

describe('AppHeader', () => {
    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
    }

    it('renders without crashing', () => {
        render(<AppHeader />)
        expect(screen.getByText('MacroDash')).toBeInTheDocument()
    })

    it('displays the MacroDash branding', () => {
        render(<AppHeader />)
        expect(screen.getByText('MacroDash')).toBeInTheDocument()
        expect(screen.getByText('Complete Market Intelligence, One Platform')).toBeInTheDocument()
    })

    it('displays the logo image', () => {
        render(<AppHeader />)
        const logo = screen.getByAltText('MacroDash Logo')
        expect(logo).toBeInTheDocument()
    })

    it('shows sign in button when no user is provided', () => {
        const onSignIn = vi.fn()
        render(<AppHeader onSignIn={onSignIn} />)
        expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('calls onSignIn when sign in button is clicked', () => {
        const onSignIn = vi.fn()
        render(<AppHeader onSignIn={onSignIn} />)

        const signInButton = screen.getByText('Sign In')
        fireEvent.click(signInButton)

        expect(onSignIn).toHaveBeenCalledTimes(1)
    })

    it('displays user information when user is logged in', () => {
        render(<AppHeader user={mockUser} />)
        expect(screen.getByText('Test')).toBeInTheDocument()
    })

    it('displays email when first_name is not available', () => {
        const userWithoutName = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
        }
        render(<AppHeader user={userWithoutName} />)
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('shows logout button when user is logged in', () => {
        const onSignOut = vi.fn()
        render(<AppHeader user={mockUser} onSignOut={onSignOut} />)
        expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('calls onSignOut when logout button is clicked', () => {
        const onSignOut = vi.fn()
        render(<AppHeader user={mockUser} onSignOut={onSignOut} />)

        const logoutButton = screen.getByText('Logout')
        fireEvent.click(logoutButton)

        expect(onSignOut).toHaveBeenCalledTimes(1)
    })

    it('does not show logout button when onSignOut is not provided', () => {
        render(<AppHeader user={mockUser} />)
        expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })

    it('does not show sign in button when onSignIn is not provided', () => {
        render(<AppHeader />)
        expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    })

    it('has correct header styling', () => {
        const { container } = render(<AppHeader />)
        const header = container.querySelector('header')
        expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50')
    })

    it('matches snapshot when logged out', () => {
        const { container } = render(<AppHeader onSignIn={vi.fn()} />)
        expect(container).toMatchSnapshot()
    })

    it('matches snapshot when logged in', () => {
        const { container } = render(<AppHeader user={mockUser} onSignOut={vi.fn()} />)
        expect(container).toMatchSnapshot()
    })
})

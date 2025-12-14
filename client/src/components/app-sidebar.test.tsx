import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AppSidebar from './app-sidebar'

// Mock the UI components
vi.mock('@/components/ui/sidebar', () => ({
    Sidebar: ({ children, ...props }: any) => <div data-testid="sidebar" {...props}>{children}</div>,
    SidebarContent: ({ children }: any) => <div data-testid="sidebar-content">{children}</div>,
    SidebarFooter: () => <div data-testid="sidebar-footer" />,
    SidebarGroup: ({ children }: any) => <div data-testid="sidebar-group">{children}</div>,
    SidebarMenu: ({ children }: any) => <ul data-testid="sidebar-menu">{children}</ul>,
    SidebarMenuButton: ({ children, isActive, tooltip, asChild, ...props }: any) => (
        <button data-testid="sidebar-menu-button" data-active={isActive} title={tooltip} {...props}>
            {children}
        </button>
    ),
    SidebarMenuItem: ({ children }: any) => <li data-testid="sidebar-menu-item">{children}</li>,
    SidebarRail: () => <div data-testid="sidebar-rail" />,
    SidebarInset: ({ children }: any) => <div data-testid="sidebar-inset">{children}</div>,
}))

describe('AppSidebar', () => {
    it('renders without crashing', () => {
        render(<AppSidebar />)
        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('renders all navigation items for non-admin users', () => {
        render(<AppSidebar isAdmin={false} />)

        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Browse Stocks')).toBeInTheDocument()
        expect(screen.getByText('Cryptocurrency')).toBeInTheDocument()
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
        expect(screen.getByText('Custom Analysis')).toBeInTheDocument()
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('does not show User Management for non-admin users', () => {
        render(<AppSidebar isAdmin={false} />)
        expect(screen.queryByText('User Management')).not.toBeInTheDocument()
    })

    it('shows User Management for admin users', () => {
        render(<AppSidebar isAdmin={true} />)
        expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('renders all navigation items for admin users', () => {
        render(<AppSidebar isAdmin={true} />)

        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Browse Stocks')).toBeInTheDocument()
        expect(screen.getByText('Cryptocurrency')).toBeInTheDocument()
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
        expect(screen.getByText('Custom Analysis')).toBeInTheDocument()
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('User Management')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('shows User Management and all items for super admin users', () => {
        render(<AppSidebar isSuperAdmin={true} />)
        expect(screen.getByText('User Management')).toBeInTheDocument()
        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('calls onNavigate when a navigation item is clicked', () => {
        const mockOnNavigate = vi.fn()
        render(<AppSidebar onNavigate={mockOnNavigate} />)

        const homeLink = screen.getByText('Home').closest('a')!
        fireEvent.click(homeLink)

        expect(mockOnNavigate).toHaveBeenCalledWith('home')
    })

    it('prevents default link behavior when onNavigate is provided', () => {
        const mockOnNavigate = vi.fn()
        render(<AppSidebar onNavigate={mockOnNavigate} />)

        const homeLink = screen.getByText('Home').closest('a')!
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
        const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')

        homeLink.dispatchEvent(clickEvent)

        expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('highlights active view', () => {
        render(<AppSidebar activeView="home" />)

        const menuButtons = screen.getAllByTestId('sidebar-menu-button')
        const homeButton = menuButtons.find(button =>
            button.querySelector('span')?.textContent === 'Home'
        )

        expect(homeButton).toHaveAttribute('data-active', 'true')
    })

    it('renders children in SidebarInset', () => {
        render(
            <AppSidebar>
                <div data-testid="child-content">Child Content</div>
            </AppSidebar>
        )

        expect(screen.getByTestId('child-content')).toBeInTheDocument()
        expect(screen.getByTestId('sidebar-inset')).toContainElement(screen.getByTestId('child-content'))
    })

    it('renders sidebar components', () => {
        render(<AppSidebar />)

        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
        expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
        expect(screen.getByTestId('sidebar-rail')).toBeInTheDocument()
    })

    it('navigates to browse view when Browse Stocks is clicked', () => {
        const mockOnNavigate = vi.fn()
        render(<AppSidebar onNavigate={mockOnNavigate} />)

        const browseLink = screen.getByText('Browse Stocks').closest('a')!
        fireEvent.click(browseLink)

        expect(mockOnNavigate).toHaveBeenCalledWith('browse')
    })

    it('navigates to crypto view when Cryptocurrency is clicked', () => {
        const mockOnNavigate = vi.fn()
        render(<AppSidebar onNavigate={mockOnNavigate} />)

        const cryptoLink = screen.getByText('Cryptocurrency').closest('a')!
        fireEvent.click(cryptoLink)

        expect(mockOnNavigate).toHaveBeenCalledWith('crypto')
    })

    it('navigates to explorer view when Data Explorer is clicked', () => {
        const mockOnNavigate = vi.fn()
        render(<AppSidebar onNavigate={mockOnNavigate} />)

        const explorerLink = screen.getByText('Data Explorer').closest('a')!
        fireEvent.click(explorerLink)

        expect(mockOnNavigate).toHaveBeenCalledWith('explorer')
    })

    it('matches snapshot for non-admin user', () => {
        const { container } = render(<AppSidebar isAdmin={false} activeView="home" />)
        expect(container).toMatchSnapshot()
    })

    it('matches snapshot for admin user', () => {
        const { container } = render(<AppSidebar isAdmin={true} activeView="home" />)
        expect(container).toMatchSnapshot()
    })
})

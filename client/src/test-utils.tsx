import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    })
}

interface WrapperProps {
    children: React.ReactNode
}

export function renderWithQueryClient(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const testQueryClient = createTestQueryClient()

    function Wrapper({ children }: WrapperProps) {
        return (
            <QueryClientProvider client={testQueryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    return render(ui, { wrapper: Wrapper, ...options })
}

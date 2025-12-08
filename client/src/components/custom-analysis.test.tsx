import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CustomAnalysis from './custom-analysis'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock Recharts since it doesn't render well in JSDOM
vi.mock('recharts', () => {
    const ResponsiveContainer = ({ children }: any) => <div className="recharts-responsive-container">{children}</div>;
    const LineChart = ({ children }: any) => <div className="recharts-line-chart">{children}</div>;
    const Line = () => <div className="recharts-line" />;
    const XAxis = () => <div className="recharts-x-axis" />;
    const YAxis = () => <div className="recharts-y-axis" />;
    const CartesianGrid = () => <div className="recharts-cartesian-grid" />;
    const Tooltip = () => <div className="recharts-tooltip" />;
    const Legend = () => <div className="recharts-legend" />;
    const ReferenceDot = () => <div className="recharts-reference-dot" />;
    const ReferenceLine = () => <div className="recharts-reference-line" />;

    return {
        ResponsiveContainer,
        LineChart,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
        ReferenceDot,
        ReferenceLine,
    }
})

// Mock react-katex
vi.mock('react-katex', () => ({
    InlineMath: ({ math }: any) => <span data-testid="katex">{math}</span>
}))

// Mock fetch for Run Analysis
global.fetch = vi.fn()

describe('CustomAnalysis Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders initial series correctly', () => {
        render(<CustomAnalysis />)
        expect(screen.getByText('BTC-USD')).toBeInTheDocument()
        expect(screen.getByText('AAPL')).toBeInTheDocument()
    })

    it('opens add preset modal and adds a preset with parameter', async () => {
        render(<CustomAnalysis />)

        const smaButton = screen.getByText('Simple Moving Average').closest('button')
        expect(smaButton).toBeInTheDocument()
        fireEvent.click(smaButton!)

        expect(screen.getByText('Add SMA')).toBeInTheDocument()
        const symbolInput = screen.getByPlaceholderText('e.g., AAPL')
        const paramInput = screen.getByPlaceholderText('e.g., 20')

        fireEvent.change(symbolInput, { target: { value: 'GOOGL' } })
        fireEvent.change(paramInput, { target: { value: '50' } })

        const addButton = screen.getByRole('button', { name: 'Add' })
        fireEvent.click(addButton)

        expect(await screen.findByText('GOOGL SMA 50')).toBeInTheDocument()
    })

    it('opens edit series modal and updates symbol', async () => {
        render(<CustomAnalysis />)

        expect(screen.getByText('AAPL')).toBeInTheDocument()

        const aaplRow = screen.getByText('AAPL').closest('div.group')
        expect(aaplRow).toBeInTheDocument()

        const buttons = aaplRow!.querySelectorAll('button')
        const editButton = buttons[1]
        fireEvent.click(editButton)

        expect(screen.getByText('Edit Series')).toBeInTheDocument()
        const input = screen.getByPlaceholderText('e.g., TSLA')

        fireEvent.change(input, { target: { value: 'NVDA' } })

        fireEvent.click(screen.getByRole('button', { name: 'Update' }))

        expect(await screen.findByText('NVDA')).toBeInTheDocument()
        expect(screen.queryByText('AAPL')).not.toBeInTheDocument()
    })

    it('shows delete confirmation and deletes series', async () => {
        render(<CustomAnalysis />)

        const msftRow = screen.getByText('MSFT').closest('div.group')
        const buttons = msftRow!.querySelectorAll('button')
        const deleteButton = buttons[2]

        fireEvent.click(deleteButton)

        expect(screen.getByText('Delete Series')).toBeInTheDocument()
        const msftElements = screen.getAllByText('MSFT')
        expect(msftElements.length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

        await waitFor(() => {
            expect(screen.queryByText('MSFT')).not.toBeInTheDocument()
        })
    })

    it('updates chart data only after run analysis', async () => {
        render(<CustomAnalysis />)

        // Mock Run Analysis response
        const mockResponse = {
            data: {
                "AAPL": {
                    series: [150, 155, 160],
                    dates: ["2023-01-01", "2023-01-02", "2023-01-03"]
                }
            }
        }
            ; (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

        const aaplRow = screen.getByText('AAPL').closest('div.group')
        const checkbox = aaplRow?.querySelector('button[role="checkbox"]')
        if (checkbox) fireEvent.click(checkbox)

        await waitFor(() => {
            const runButton = screen.getByText('Run Analysis').closest('button')
            expect(runButton).not.toBeDisabled()
            fireEvent.click(runButton!)
        })

        expect(globalThis.fetch).toHaveBeenCalled()

        await waitFor(() => {
            expect(screen.queryByText('Select series and click "Run Analysis"')).not.toBeInTheDocument()
        })
    })
})

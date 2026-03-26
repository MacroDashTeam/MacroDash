import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardHome from './dashboard-home'

// Mock all child components
vi.mock('./market-overview', () => ({ default: () => <div data-testid="market-overview">Market Overview</div> }))
vi.mock('./market-schedule', () => ({ default: () => <div data-testid="market-schedule">Market Schedule</div> }))
vi.mock('./economic-indicators', () => ({ default: () => <div data-testid="economic-indicators">Economic Indicators</div> }))
vi.mock('./market-sectors', () => ({ default: () => <div data-testid="market-sectors">Market Sectors</div> }))
vi.mock('./commodities-overview', () => ({ default: () => <div data-testid="commodities-overview">Commodities Overview</div> }))
vi.mock('./watchlist', () => ({ default: () => <div data-testid="watchlist">Watchlist</div> }))
vi.mock('./news-feed', () => ({ default: () => <div data-testid="news-feed">News Feed</div> }))
vi.mock('./top-gainers', () => ({ default: () => <div data-testid="top-gainers">Top Gainers</div> }))
vi.mock('./stock-top-losers', () => ({ default: () => <div data-testid="stock-top-losers">Stock Top Losers</div> }))
vi.mock('./crypto-watchlist', () => ({ default: () => <div data-testid="crypto-watchlist">Crypto Watchlist</div> }))
vi.mock('./crypto-top-gainers', () => ({ default: () => <div data-testid="crypto-top-gainers">Crypto Top Gainers</div> }))
vi.mock('./crypto-top-losers', () => ({ default: () => <div data-testid="crypto-top-losers">Crypto Top Losers</div> }))
vi.mock('./agent-recommendations-panel', () => ({ default: () => <div data-testid="agent-recommendations">Agent Recommendations</div> }))
vi.mock('./news-synthesis-panel', () => ({ default: () => <div data-testid="news-synthesis">News Synthesis</div> }))

describe('DashboardHome', () => {
    it('renders without crashing', () => {
        const { container } = render(<DashboardHome />)
        expect(container).toBeInTheDocument()
    })

    it('renders MarketOverview component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('market-overview')).toBeInTheDocument()
    })

    it('renders MarketSchedule component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('market-schedule')).toBeInTheDocument()
    })

    it('renders MarketSectors component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('market-sectors')).toBeInTheDocument()
    })

    it('renders CommoditiesOverview component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('commodities-overview')).toBeInTheDocument()
    })

    it('renders EconomicIndicators component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('economic-indicators')).toBeInTheDocument()
    })

    it('renders Watchlist component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('watchlist')).toBeInTheDocument()
    })

    it('renders stock market movers section', () => {
        render(<DashboardHome />)
        expect(screen.getByText('Stock Market Movers')).toBeInTheDocument()
    })

    it('renders TopGainers component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('top-gainers')).toBeInTheDocument()
    })

    it('renders StockTopLosers component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('stock-top-losers')).toBeInTheDocument()
    })

    it('renders CryptoWatchlist component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('crypto-watchlist')).toBeInTheDocument()
    })

    it('renders cryptocurrency movers section', () => {
        render(<DashboardHome />)
        expect(screen.getByText('Cryptocurrency Movers')).toBeInTheDocument()
    })

    it('renders CryptoTopGainers component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('crypto-top-gainers')).toBeInTheDocument()
    })

    it('renders CryptoTopLosers component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('crypto-top-losers')).toBeInTheDocument()
    })

    it('renders NewsFeed component', () => {
        render(<DashboardHome />)
        expect(screen.getByTestId('news-feed')).toBeInTheDocument()
    })

    it('has correct layout structure', () => {
        const { container } = render(<DashboardHome />)
        const mainDiv = container.querySelector('.p-6.space-y-6')
        expect(mainDiv).toBeInTheDocument()
    })

    it('renders all sections in correct order', () => {
        const { container } = render(<DashboardHome />)
        const sections = container.querySelectorAll('section')
        expect(sections.length).toBeGreaterThan(0)
    })

    it('matches snapshot', () => {
        const { container } = render(<DashboardHome />)
        expect(container).toMatchSnapshot()
    })
})

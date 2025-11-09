import MarketOverview from './market-overview'
import MarketSchedule from './market-schedule'
import EconomicIndicators from './economic-indicators'
import MarketSectors from './market-sectors'
import CommoditiesOverview from './commodities-overview'
import Watchlist from './watchlist'
import NewsFeed from './news-feed'
import TopGainers from './top-gainers'
import StockTopLosers from './stock-top-losers'
import CryptoWatchlist from './crypto-watchlist'
import CryptoTopGainers from './crypto-top-gainers'
import CryptoTopLosers from './crypto-top-losers'

export default function DashboardHome() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">MacroDash</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time market insights and economic data</p>
        </div>
      </div>

      {/* Market Overview - Major Indices */}
      <section>
        <MarketOverview />
      </section>

      {/* Market Schedule */}
      <section>
        <MarketSchedule />
      </section>

      {/* Market Sectors */}
      <section>
        <MarketSectors />
      </section>

      {/* Commodities & Indices */}
      <section>
        <CommoditiesOverview />
      </section>

      {/* Economic Indicators */}
      <section>
        <EconomicIndicators />
      </section>

      {/* Stock Watchlist */}
      <section>
        <Watchlist />
      </section>

      {/* Stock Top Gainers & Losers */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Stock Market Movers</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopGainers />
          <StockTopLosers />
        </div>
      </section>

      {/* Crypto Watchlist */}
      <section>
        <CryptoWatchlist />
      </section>

      {/* Crypto Top Gainers & Losers */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Cryptocurrency Movers</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CryptoTopGainers />
          <CryptoTopLosers />
        </div>
      </section>

      {/* News Feed */}
      <section>
        <NewsFeed />
      </section>
    </div>
  )
}



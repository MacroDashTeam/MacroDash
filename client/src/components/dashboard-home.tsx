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
import AgentRecommendationsPanel from './agent-recommendations-panel'
import NewsSynthesisPanel from './news-synthesis-panel'

export default function DashboardHome() {
  return (
    <div className="p-6 space-y-6">
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

      {/* Agent Recommendations */}
      <section>
        <AgentRecommendationsPanel />
      </section>

      {/* News Synthesis */}
      <section>
        <NewsSynthesisPanel />
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



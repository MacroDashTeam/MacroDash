import { EconomicIndicatorsChart } from './EconomicIndicatorsChart'
import { StockMarketChart } from './StockMarketChart'
import { NewsFeed } from './NewsFeed'

export function DashboardHome() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-y-auto">
    <div className="p-6">
        {/* Top Section - Two squares side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
          {/* Left Square - Economic Indicators */}
          <div className="h-full">
            <EconomicIndicatorsChart />
          </div>
          
          {/* Right Square - Stock Market */}
          <div className="h-full">
            <StockMarketChart />
          </div>
        </div>
        
        {/* Bottom Section - News Feed Rectangle */}
        <div className="h-[400px]">
          <NewsFeed />
        </div>
      </div>
    </div>
  )
}
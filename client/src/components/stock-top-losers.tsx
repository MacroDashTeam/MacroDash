import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'

type StockData = {
  name: string
  current_price: number
  change: number
  change_percent: number
}

type MarketResponse = {
  status: string
  data: Record<string, StockData>
  timestamp: string
}

async function fetchMarketData(): Promise<MarketResponse> {
  const response = await fetch('/api/stocks/')
  if (!response.ok) throw new Error('Failed to fetch market data')
  return response.json()
}

export default function StockTopLosers() {
  const { data, isLoading, isError } = useQuery<MarketResponse>({
    queryKey: ['stock-top-losers'],
    queryFn: fetchMarketData,
    refetchInterval: 60000, // Refresh every minute
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">📉</div>
          <h2 className="text-lg font-semibold">Top Losers (Stocks)</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">📉</div>
          <h2 className="text-lg font-semibold">Top Losers (Stocks)</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load data</p>
      </div>
    )
  }

  // Get top losers by sorting by change_percent (lowest first)
  const topLosers = Object.entries(data.data)
    .filter(([symbol]) => !symbol.startsWith('^') && !symbol.endsWith('=F')) // Filter out indices and futures
    .sort(([, a], [, b]) => a.change_percent - b.change_percent)
    .slice(0, 5)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl">📉</div>
          <h2 className="text-lg font-semibold">Top Losers (Stocks)</h2>
        </div>
      </div>

      <div className="space-y-2">
        {topLosers.map(([symbol, stock], index) => {
          const isPositive = stock.change_percent >= 0
          return (
            <div
              key={symbol}
              className="flex items-center justify-between py-2 px-3 rounded hover:bg-zinc-800/30 transition-colors cursor-pointer"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'stock' } }))
                window.dispatchEvent(new CustomEvent('navigate-stock', { detail: { symbol } }))
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-zinc-500 font-medium text-sm w-6">{index + 1}.</div>
                <div>
                  <div className="font-semibold text-zinc-200">{symbol}</div>
                  <div className="text-xs text-zinc-500">${stock.current_price.toFixed(2)}</div>
                </div>
              </div>

              <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? '+' : ''}{stock.change_percent.toFixed(2)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {topLosers.length === 0 && (
        <div className="text-center py-8 text-zinc-500 text-sm">
          No losers data available
        </div>
      )}
    </div>
  )
}

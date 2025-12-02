import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Flame } from 'lucide-react'

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
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${API_BASE}/api/stocks/`)
  if (!response.ok) throw new Error('Failed to fetch market data')
  return await response.json()
}

export default function TopGainers() {
  const { data, isLoading, isError } = useQuery<MarketResponse>({
    queryKey: ['top-gainers'],
    queryFn: fetchMarketData,
    refetchInterval: 60000, // Refresh every minute
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Top Gainers</h2>
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
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Top Gainers</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load data</p>
      </div>
    )
  }

  // Define sector ETFs to exclude
  const sectorETFs = ['XLK', 'XLF', 'XLY', 'XLC', 'XLV', 'XLI', 'XLP', 'XLE', 'XLB', 'XLRE', 'XLU']

  // Get top gainers by sorting by change_percent - only positive changes
  const topGainers = Object.entries(data.data)
    .filter(([symbol, stock]) =>
      !symbol.startsWith('^') &&           // Filter out indices
      !symbol.endsWith('=F') &&            // Filter out futures
      !sectorETFs.includes(symbol) &&      // Filter out sector ETFs
      stock.change_percent > 0             // Only positive changes
    )
    .sort(([, a], [, b]) => b.change_percent - a.change_percent)
    .slice(0, 5)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Top Gainers</h2>
        </div>
      </div>

      <div className="space-y-2">
        {topGainers.map(([symbol, stock], index) => (
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

              <div className="flex items-center gap-1 font-semibold text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span>+{stock.change_percent.toFixed(2)}%</span>
              </div>
            </div>
          ))}
      </div>

      {topGainers.length === 0 && (
        <div className="text-center py-8 text-zinc-500 text-sm">
          No gainers data available
        </div>
      )}
    </div>
  )
}

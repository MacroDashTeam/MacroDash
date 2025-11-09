import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CommodityData {
  name: string
  current_price: number
  change: number
  change_percent: number
  volume: number
  last_updated: string
}

interface MarketData {
  status: string
  data: Record<string, CommodityData>
  timestamp: string
}

async function fetchCommodities(): Promise<MarketData> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const response = await fetch(`${API_BASE}/api/stocks/`)
  if (!response.ok) throw new Error('Failed to fetch commodities')
  return await response.json()
}

export default function CommoditiesOverview() {
  const { data, isLoading, isError } = useQuery<MarketData>({
    queryKey: ['commodities-overview'],
    queryFn: fetchCommodities,
    refetchInterval: 60000, // Refresh every minute
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Commodities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Commodities</h2>
        <p className="text-red-400 text-sm">Failed to load commodities data</p>
      </div>
    )
  }

  // Select specific commodities to display
  const commodities = [
    { symbol: 'GC=F', name: 'Gold', unit: '/oz' },
    { symbol: 'SI=F', name: 'Silver', unit: '/oz' },
    { symbol: 'DX-Y.NYB', name: 'US Dollar Index', unit: '' },
  ]

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Commodities & Indices</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {commodities.map(({ symbol, name, unit }) => {
          const commodity = data.data[symbol]

          if (!commodity) return null

          const isPositive = commodity.change_percent >= 0

          return (
            <div
              key={symbol}
              className="p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-zinc-200">{name}</h3>
                  <p className="text-xs text-zinc-500">{symbol}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{isPositive ? '+' : ''}{commodity.change_percent.toFixed(2)}%</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-bold text-zinc-100">
                  ${commodity.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}{unit}
                </div>
                <div className={`text-sm mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{commodity.change.toFixed(2)}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Volume</span>
                  <span>{commodity.volume ? (commodity.volume / 1e6).toFixed(2) + 'M' : 'N/A'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

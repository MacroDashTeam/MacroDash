import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'

type MarketData = {
  name: string
  current_price: number
  change: number
  change_percent: number
  volume: number
  last_updated: string
  historical: Array<{
    date: string
    close: number
  }>
}

type MarketResponse = {
  status: string
  data: Record<string, MarketData>
  timestamp: string
}

async function fetchMarketData(): Promise<MarketResponse> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

const response = await fetch(`${API_BASE}/api/stocks/`)
  if (!response.ok) throw new Error('Failed to fetch market data')
  return await response.json()
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function IndexCard({ symbol, data }: { symbol: string; data: MarketData }) {
  const isPositive = data.change >= 0
  const sparklineData = data.historical?.slice(-30).map(h => h.close) || []

  return (
    <div
      className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900/80 transition-colors cursor-pointer"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'stock' } }))
        window.dispatchEvent(new CustomEvent('navigate-stock', { detail: { symbol } }))
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-400">{data.name || symbol}</h3>
        <span className="text-xs text-zinc-500">{symbol}</span>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-mono font-semibold mb-1">
          {data.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{isPositive ? '+' : ''}{data.change.toFixed(2)}</span>
          <span>({isPositive ? '+' : ''}{data.change_percent.toFixed(2)}%)</span>
        </div>
      </div>

      <div className={isPositive ? 'text-green-500' : 'text-red-500'}>
        <Sparkline data={sparklineData} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500">
        <div>
          <div className="text-zinc-600">Volume</div>
          <div>{data.volume ? (data.volume / 1000000).toFixed(1) + 'M' : 'N/A'}</div>
        </div>
        <div>
          <div className="text-zinc-600">Updated</div>
          <div>{data.last_updated}</div>
        </div>
      </div>
    </div>
  )
}

export default function MarketOverview() {
  const [activeRegion, setActiveRegion] = useState<'us' | 'asia' | 'europe' | 'other'>('us')

  const { data, isLoading, isError } = useQuery<MarketResponse>({
    queryKey: ['market-overview'],
    queryFn: fetchMarketData,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const regions = {
    us: {
      label: '🇺🇸 US Markets',
      indices: ['^GSPC', '^DJI', '^IXIC']
    },
    asia: {
      label: '🌏 Asian Markets',
      indices: ['^N225', '^HSI', '000001.SS', '^STI', '^KS11', '^TWII']
    },
    europe: {
      label: '🇪🇺 European Markets',
      indices: ['^FTSE', '^GDAXI', '^FCHI', '^STOXX50E']
    },
    other: {
      label: '🌎 Other Markets',
      indices: ['^AXJO', '^BVSP', '^VIX', 'GC=F']
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {Object.entries(regions).map(([key, region]) => (
            <button
              key={key}
              className="px-4 py-2 rounded-lg bg-zinc-800/50 animate-pulse"
            >
              {region.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="text-red-400 text-sm">Failed to load market data</p>
      </div>
    )
  }

  const currentIndices = regions[activeRegion].indices

  return (
    <div>
      {/* Region Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {Object.entries(regions).map(([key, region]) => (
          <button
            key={key}
            onClick={() => setActiveRegion(key as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeRegion === key
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {region.label}
          </button>
        ))}
      </div>

      {/* Indices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentIndices.map(symbol => {
          const indexData = data.data[symbol]
          if (!indexData) return null
          return <IndexCard key={symbol} symbol={symbol} data={indexData} />
        })}
      </div>
    </div>
  )
}

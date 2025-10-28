import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'

type SectorData = {
  name: string
  current_price: number
  change: number
  change_percent: number
  historical: Array<{
    date: string
    close: number
  }>
}

type MarketResponse = {
  status: string
  data: Record<string, SectorData>
  timestamp: string
}

async function fetchMarketData(): Promise<MarketResponse> {
  const response = await fetch('/api/stocks/', {
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) throw new Error('Failed to fetch market data')
  return response.json()
}

const SECTOR_MAP: Record<string, { name: string; icon: string }> = {
  'XLK': { name: 'Technology', icon: '💻' },
  'XLF': { name: 'Financial', icon: '🏦' },
  'XLV': { name: 'Healthcare', icon: '⚕️' },
  'XLE': { name: 'Energy', icon: '⚡' },
  'XLY': { name: 'Consumer Disc.', icon: '🛍️' },
  'XLP': { name: 'Consumer Staples', icon: '🛒' },
  'XLI': { name: 'Industrial', icon: '🏭' },
  'XLB': { name: 'Materials', icon: '⚒️' },
  'XLRE': { name: 'Real Estate', icon: '🏢' },
  'XLU': { name: 'Utilities', icon: '💡' },
  'XLC': { name: 'Communication', icon: '📡' },
}

function MiniSparkline({ data }: { data: number[] }) {
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
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function SectorCard({ symbol, data }: { symbol: string; data: SectorData }) {
  const sectorInfo = SECTOR_MAP[symbol]
  if (!sectorInfo) return null

  const isPositive = data.change_percent >= 0
  const sparklineData = data.historical?.slice(-7).map(h => h.close) || []

  return (
    <div
      className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900/80 transition-colors cursor-pointer"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'stock' } }))
        window.dispatchEvent(new CustomEvent('navigate-stock', { detail: { symbol } }))
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl flex-shrink-0">{sectorInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-zinc-200 truncate">{sectorInfo.name}</div>
          <div className="text-xs text-zinc-500">{symbol}</div>
        </div>
      </div>

      <div className={`flex items-center gap-1 mb-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="font-semibold">{isPositive ? '+' : ''}{data.change_percent.toFixed(2)}%</span>
      </div>

      <div className={isPositive ? 'text-green-500' : 'text-red-500'}>
        <MiniSparkline data={sparklineData} />
      </div>
    </div>
  )
}

export default function MarketSectors() {
  const { data, isLoading, isError } = useQuery<MarketResponse>({
    queryKey: ['market-sectors'],
    queryFn: fetchMarketData,
    refetchInterval: 60000,
    retry: 2,
    retryDelay: 1000,
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">💼</div>
          <h2 className="text-lg font-semibold">Market Sectors</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i} className="h-32 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">💼</div>
          <h2 className="text-lg font-semibold">Market Sectors</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load sector data</p>
      </div>
    )
  }

  const sectors = Object.keys(SECTOR_MAP)
    .map(symbol => ({ symbol, data: data.data[symbol] }))
    .filter(item => item.data)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl">💼</div>
          <h2 className="text-lg font-semibold">Market Sectors</h2>
        </div>
        <div className="text-xs text-zinc-500">{sectors.length} sectors</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {sectors.map(({ symbol, data }) => (
          <SectorCard key={symbol} symbol={symbol} data={data} />
        ))}
      </div>
    </div>
  )
}

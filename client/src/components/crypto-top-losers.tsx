import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'

type CryptoData = {
  id: number
  symbol: string
  name: string
  current_price: number
  change_24h: number
}

type CryptoResponse = {
  status: string
  data: {
    cryptos: CryptoData[]
    total: number
  }
  timestamp: string
}

async function fetchTopLosers(): Promise<CryptoResponse> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${API_BASE}/api/crypto/top/losers/?limit=5`)
  if (!response.ok) throw new Error('Failed to fetch crypto losers')
  return await response.json()
}

export default function CryptoTopLosers() {
  const { data, isLoading, isError } = useQuery<CryptoResponse>({
    queryKey: ['crypto-top-losers'],
    queryFn: fetchTopLosers,
    refetchInterval: 60000, // Refresh every minute
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">💔</div>
          <h2 className="text-lg font-semibold">Top Losers (Crypto)</h2>
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
          <div className="text-2xl">💔</div>
          <h2 className="text-lg font-semibold">Top Losers (Crypto)</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load data</p>
      </div>
    )
  }

  // Filter to only show negative changes
  const topLosers = (data.data.cryptos || []).filter(crypto => crypto.change_24h < 0)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl">💔</div>
          <h2 className="text-lg font-semibold">Top Losers (Crypto)</h2>
        </div>
      </div>

      <div className="space-y-2">
        {topLosers.map((crypto, index) => (
            <div
              key={crypto.id}
              className="flex items-center justify-between py-2 px-3 rounded hover:bg-zinc-800/30 transition-colors cursor-pointer"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigate-to-crypto', { detail: crypto.symbol }))
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-zinc-500 font-medium text-sm w-6">{index + 1}.</div>
                <img
                  src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${crypto.id}.png`}
                  alt={crypto.name}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/24'
                  }}
                />
                <div>
                  <div className="font-semibold text-zinc-200">{crypto.symbol}</div>
                  <div className="text-xs text-zinc-500">
                    ${crypto.current_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: crypto.current_price < 1 ? 4 : 2
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 font-semibold text-red-500">
                <TrendingDown className="w-4 h-4" />
                <span>{crypto.change_24h.toFixed(2)}%</span>
              </div>
            </div>
          ))}
      </div>

      {topLosers.length === 0 && (
        <div className="text-center py-8 text-zinc-500 text-sm">
          No losers data available
        </div>
      )}
    </div>
  )
}

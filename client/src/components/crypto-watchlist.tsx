import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { useState } from 'react'

type CryptoData = {
  id: number
  symbol: string
  name: string
  current_price: number
  change_1h: number
  change_24h: number
  change_7d: number
  market_cap: number
  volume_24h: number
}

type CryptoListResponse = {
  status: string
  data: {
    cryptos: CryptoData[]
    total: number
  }
  timestamp: string
}

async function fetchCryptoData(): Promise<CryptoListResponse> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

const response = await fetch(`${API_BASE}/api/crypto/?limit=100`)
  if (!response.ok) throw new Error('Failed to fetch crypto data')
  return await response.json()
}

function MicroSparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return <div className="text-xs text-zinc-600">—</div>

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  const isPositive = data[data.length - 1] >= data[0]

  return (
    <svg className="w-16 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function CryptoWatchlistRow({ crypto }: { crypto: CryptoData }) {
  const isPositive = crypto.change_24h >= 0
  // Create simple trend data from available changes
  const sparklineData = [
    crypto.current_price * (1 - crypto.change_7d / 100),
    crypto.current_price * (1 - crypto.change_24h / 100),
    crypto.current_price * (1 - crypto.change_1h / 100),
    crypto.current_price
  ]

  return (
    <div
      className="grid grid-cols-6 gap-4 py-3 px-2 hover:bg-zinc-800/30 rounded transition-colors cursor-pointer"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('navigate-to-crypto', { detail: crypto.symbol }))
      }}
    >
      <div className="col-span-2 flex items-center gap-2">
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
          <div className="text-xs text-zinc-500 truncate">{crypto.name}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-mono font-semibold">
          ${crypto.current_price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: crypto.current_price < 1 ? 4 : 2
          })}
        </div>
        <div className={`text-xs ${crypto.change_1h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {crypto.change_1h >= 0 ? '+' : ''}{crypto.change_1h.toFixed(2)}% 1h
        </div>
      </div>

      <div className="text-right">
        <div className={`flex items-center justify-end gap-1 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{crypto.change_24h.toFixed(2)}%</span>
        </div>
      </div>

      <div className="text-right">
        <div className={`text-sm ${crypto.change_7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {crypto.change_7d >= 0 ? '+' : ''}{crypto.change_7d.toFixed(2)}%
        </div>
        <div className="text-xs text-zinc-500">7d</div>
      </div>

      <div className={`flex items-center justify-end ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <MicroSparkline data={sparklineData} />
      </div>
    </div>
  )
}

export default function CryptoWatchlist() {
  const [watchlistSymbols, setWatchlistSymbols] = useState(['BTC', 'ETH', 'BNB', 'SOL', 'XRP'])
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data, isLoading, isError } = useQuery<CryptoListResponse>({
    queryKey: ['crypto-watchlist-data'],
    queryFn: fetchCryptoData,
    refetchInterval: 60000, // Refresh every minute
  })

  const handleAddCrypto = (symbol: string) => {
    if (!watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols([...watchlistSymbols, symbol])
      setShowAddDialog(false)
    }
  }

  // Popular cryptos to add
  const popularCryptos = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'XRP', name: 'XRP' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'UNI', name: 'Uniswap' }
  ]

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl">₿</div>
            <h2 className="text-lg font-semibold">Crypto Watchlist</h2>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">₿</div>
          <h2 className="text-lg font-semibold">Crypto Watchlist</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load crypto watchlist data</p>
      </div>
    )
  }

  // Find watched cryptos from the full list
  const watchedCryptos = data.data.cryptos.filter(crypto =>
    watchlistSymbols.includes(crypto.symbol)
  )

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl">₿</div>
          <h2 className="text-lg font-semibold">Crypto Watchlist</h2>
        </div>
        <button
          onClick={() => setShowAddDialog(!showAddDialog)}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded hover:bg-zinc-800/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Crypto</span>
        </button>
      </div>

      {/* Add Crypto Dialog */}
      {showAddDialog && (
        <div className="mb-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Add Cryptocurrency</h3>
            <button
              onClick={() => setShowAddDialog(false)}
              className="text-zinc-400 hover:text-zinc-200"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {popularCryptos.filter(c => !watchlistSymbols.includes(c.symbol)).map(crypto => (
              <button
                key={crypto.symbol}
                onClick={() => handleAddCrypto(crypto.symbol)}
                className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors text-left"
              >
                <div className="font-semibold">{crypto.symbol}</div>
                <div className="text-xs text-zinc-400">{crypto.name}</div>
              </button>
            ))}
          </div>
          {popularCryptos.filter(c => !watchlistSymbols.includes(c.symbol)).length === 0 && (
            <div className="text-center text-sm text-zinc-500 py-4">
              All popular cryptocurrencies are already in your watchlist
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <div className="grid grid-cols-6 gap-4 pb-2 px-2 text-xs text-zinc-500 font-medium border-b border-zinc-800">
          <div className="col-span-2">Symbol</div>
          <div className="text-right">Price</div>
          <div className="text-right">24h Change</div>
          <div className="text-right">7d Change</div>
          <div className="text-right">Trend</div>
        </div>

        {watchedCryptos.map(crypto => (
          <CryptoWatchlistRow key={crypto.id} crypto={crypto} />
        ))}
      </div>

      {watchedCryptos.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="mb-2">No cryptocurrencies in your watchlist</p>
          <p className="text-sm">Click "Add Crypto" to start tracking</p>
        </div>
      )}
    </div>
  )
}

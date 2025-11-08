import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

type StockData = {
  name: string
  current_price: number
  change: number
  change_percent: number
  volume: number
  historical: Array<{
    date: string
    close: number
  }>
}

type MarketResponse = {
  status: string
  data: Record<string, StockData>
  timestamp: string
}

type SentimentResponse = {
  status: string
  data: {
    symbol: string
    overall_sentiment: string
    sentiment_score: number
    confidence: number
  }
  timestamp: string
}

async function fetchMarketData(): Promise<MarketResponse> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${API_BASE}/api/stocks/`)
  if (!response.ok) throw new Error('Failed to fetch market data')
  return await response.json()
}

async function fetchSentiment(symbol: string): Promise<SentimentResponse> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const response = await fetch(`${API_BASE}/api/sentiment/${symbol}/`)
  if (!response.ok) throw new Error('Failed to fetch sentiment')
  return response.json()
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

  return (
    <svg className="w-16 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
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

function SentimentBadge({ symbol }: { symbol: string }) {
  const { data } = useQuery<SentimentResponse>({
    queryKey: ['sentiment', symbol],
    queryFn: () => fetchSentiment(symbol),
    staleTime: 300000, // 5 minutes
  })

  if (!data) return <div className="text-xs text-zinc-600">Loading...</div>

  const sentiment = data.data.overall_sentiment
  const confidence = Math.round(data.data.confidence * 100)

  const emoji = sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😟' : '😐'
  const color = sentiment === 'positive' ? 'text-green-500' : sentiment === 'negative' ? 'text-red-500' : 'text-yellow-500'

  return (
    <div className={`text-sm ${color}`}>
      {emoji} {confidence}%
    </div>
  )
}

function WatchlistRow({ symbol, data, onRemove }: { symbol: string; data: StockData; onRemove: () => void }) {
  const isPositive = data.change >= 0
  const sparklineData = data.historical?.slice(-7).map(h => h.close) || []

  return (
    <div className="grid grid-cols-6 gap-4 py-3 px-2 hover:bg-zinc-800/30 rounded transition-colors group relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded p-1"
        title="Remove from watchlist"
      >
        <X className="w-4 h-4" />
      </button>

      <div
        className="col-span-6 grid grid-cols-6 gap-4 cursor-pointer"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'stock' } }))
          window.dispatchEvent(new CustomEvent('navigate-stock', { detail: { symbol } }))
        }}
      >
      <div className="col-span-2">
        <div className="font-semibold text-zinc-200">{symbol}</div>
        <div className="text-xs text-zinc-500 truncate">{data.name}</div>
      </div>

      <div className="text-right">
        <div className="font-mono font-semibold">${data.current_price.toFixed(2)}</div>
        <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{data.change.toFixed(2)}
        </div>
      </div>

      <div className="text-right">
        <div className={`flex items-center justify-end gap-1 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{data.change_percent.toFixed(2)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <SentimentBadge symbol={symbol} />
      </div>

      <div className={`flex items-center justify-end ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <MicroSparkline data={sparklineData} />
      </div>
      </div>
    </div>
  )
}

export default function Watchlist() {
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    // Load from localStorage or use default
    const saved = localStorage.getItem('watchlist')
    return saved ? JSON.parse(saved) : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')

  const { data, isLoading, isError } = useQuery<MarketResponse>({
    queryKey: ['watchlist-data'],
    queryFn: fetchMarketData,
    refetchInterval: 60000, // Refresh every minute
  })

  const handleAddStock = () => {
    const symbol = newSymbol.trim().toUpperCase()

    if (!symbol) {
      alert('Please enter a stock symbol')
      return
    }

    if (watchlistSymbols.includes(symbol)) {
      alert(`${symbol} is already in your watchlist`)
      return
    }

    const updatedList = [...watchlistSymbols, symbol]
    setWatchlistSymbols(updatedList)
    localStorage.setItem('watchlist', JSON.stringify(updatedList))

    setNewSymbol('')
    setShowAddDialog(false)
  }

  const handleRemoveStock = (symbol: string) => {
    const updatedList = watchlistSymbols.filter((s: string) => s !== symbol)
    setWatchlistSymbols(updatedList)
    localStorage.setItem('watchlist', JSON.stringify(updatedList))
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl">📈</div>
            <h2 className="text-lg font-semibold">Your Watchlist</h2>
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
          <div className="text-2xl">📈</div>
          <h2 className="text-lg font-semibold">Your Watchlist</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load watchlist data</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl">📈</div>
          <h2 className="text-lg font-semibold">Your Watchlist</h2>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded hover:bg-zinc-800/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock</span>
        </button>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-6 gap-4 pb-2 px-2 text-xs text-zinc-500 font-medium border-b border-zinc-800">
          <div className="col-span-2">Symbol</div>
          <div className="text-right">Price</div>
          <div className="text-right">Change</div>
          <div className="text-center">Sentiment</div>
          <div className="text-right">Trend</div>
        </div>

        {watchlistSymbols.map(symbol => {
          const stockData = data.data[symbol]
          if (!stockData) return null
          return (
            <WatchlistRow
              key={symbol}
              symbol={symbol}
              data={stockData}
              onRemove={() => handleRemoveStock(symbol)}
            />
          )
        })}
      </div>

      {watchlistSymbols.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="mb-2">No stocks in your watchlist</p>
          <p className="text-sm">Click "Add Stock" to start tracking</p>
        </div>
      )}

      {/* Add Stock Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddDialog(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Stock to Watchlist</h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Stock Symbol</label>
                <Input
                  type="text"
                  placeholder="e.g., TSLA, NFLX, META"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
                  className="bg-zinc-800 border-zinc-700"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="border-zinc-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddStock}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Stock
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

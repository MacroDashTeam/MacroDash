import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, ArrowLeft, ExternalLink, Globe, ChevronDown, BookmarkPlus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { saveCryptoPriceChart } from '@/lib/save-to-dashboard'

type TimePeriod = '1' | '7' | '30' | '90' | '180' | '365'
type ChartType = 'line' | 'candle' | 'bar'

interface CryptoDetail {
  id: number
  symbol: string
  name: string
  slug: string
  description: string
  website: string[]
  whitepaper: string[]
  twitter: string[]
  logo: string
  cmc_rank: number
  current_price: number
  market_cap: number
  market_cap_dominance: number
  fully_diluted_market_cap: number
  volume_24h: number
  circulating_supply: number
  total_supply: number | null
  max_supply: number | null
  change_1h: number
  change_24h: number
  change_7d: number
  change_30d: number
  change_60d: number
  change_90d: number
  last_updated: string
}

interface CryptoDetailResponse {
  status: string
  data: CryptoDetail
  timestamp: string
}

async function fetchCryptoDetail(symbol: string) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const res = await fetch(`${API_BASE}/api/crypto/${symbol}/`)
  if (!res.ok) throw new Error('Failed to fetch crypto data')
  return await res.json()
}

async function fetchCryptoHistorical(symbol: string, days: number) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const res = await fetch(`${API_BASE}/api/crypto/${symbol}/historical/?days=${days}`)
  if (!res.ok) throw new Error('Failed to fetch historical data')
  return await res.json()
}

async function fetchCryptoOHLC(symbol: string, days: number) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const res = await fetch(`${API_BASE}/api/crypto/${symbol}/ohlc/?days=${days}`)
  if (!res.ok) throw new Error('Failed to fetch OHLC data')
  return await res.json()
}

// Candlestick shape component
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, openClose } = props
  const isGreen = openClose[1] > openClose[0]
  const color = isGreen ? '#22c55e' : '#ef4444'
  const ratio = Math.abs(height / (openClose[0] - openClose[1]))

  return (
    <g stroke={color} fill="none" strokeWidth="1">
      <path
        d={`
          M ${x},${y}
          L ${x},${y + height}
          L ${x + width},${y + height}
          L ${x + width},${y}
          L ${x},${y}
        `}
        fill={color}
        opacity="0.8"
      />
      {/* High wick */}
      <path
        d={`
          M ${x + width / 2}, ${y}
          L ${x + width / 2}, ${y - (high - openClose[1]) * ratio}
        `}
        stroke={color}
      />
      {/* Low wick */}
      <path
        d={`
          M ${x + width / 2}, ${y + height}
          L ${x + width / 2}, ${y + height + (openClose[0] - low) * ratio}
        `}
        stroke={color}
      />
    </g>
  )
}

const prepareOHLCData = (ohlcData: any[]) => {
  return ohlcData.map((item) => ({
    ...item,
    openClose: [item.open, item.close],
    highLow: [item.high, item.low],
  }))
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toFixed(2)}`
}

function formatSupply(supply: number): string {
  if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`
  if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`
  if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`
  return supply.toFixed(2)
}

export default function CryptoDetail({ onBack }: { onBack?: () => void }) {
  const [symbol, setSymbol] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7')
  const [chartType, setChartType] = useState<ChartType>('line')

  useEffect(() => {
    // Listen for crypto navigation events
    const handleCryptoNav = (e: CustomEvent) => {
      if (e.detail) {
        setSymbol(e.detail.toUpperCase())
      }
    }

    window.addEventListener('navigate-to-crypto' as any, handleCryptoNav)
    return () => window.removeEventListener('navigate-to-crypto' as any, handleCryptoNav)
  }, [])

  const { data: cryptoData, isLoading } = useQuery<CryptoDetailResponse>({
    queryKey: ['crypto-detail', symbol],
    queryFn: () => fetchCryptoDetail(symbol!),
    enabled: !!symbol,
    refetchInterval: 60000, // Refetch every minute
  })

  const { data: historicalData } = useQuery({
    queryKey: ['crypto-historical', symbol, timePeriod],
    queryFn: () => fetchCryptoHistorical(symbol!, parseInt(timePeriod)),
    enabled: !!symbol && chartType === 'line',
    refetchInterval: 300000, // Refetch every 5 minutes
  })

  const { data: ohlcData } = useQuery({
    queryKey: ['crypto-ohlc', symbol, timePeriod],
    queryFn: () => fetchCryptoOHLC(symbol!, parseInt(timePeriod)),
    enabled: !!symbol && (chartType === 'candle' || chartType === 'bar'),
    refetchInterval: 300000, // Refetch every 5 minutes
  })

  const crypto = cryptoData?.data

  const handleSaveToDashboard = async () => {
    if (!symbol || !crypto) return

    const success = await saveCryptoPriceChart(symbol, crypto.name)
    if (success) {
      alert('Chart saved to Dashboard!')
    } else {
      alert('Failed to save chart to Dashboard')
    }
  }

  if (!symbol) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">No Cryptocurrency Specified</h1>
          <p className="text-zinc-400 mt-2">Please select a cryptocurrency to view</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading {symbol} data...</p>
        </div>
      </div>
    )
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">Cryptocurrency Not Found</h1>
          <p className="text-zinc-400 mt-2">Could not load data for {symbol}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="flex items-center gap-4 flex-1">
          <img
            src={crypto.logo}
            alt={crypto.name}
            className="w-12 h-12 rounded-full"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/48'
            }}
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{crypto.name}</h1>
              <Badge variant="outline" className="text-zinc-400">
                {crypto.symbol}
              </Badge>
              <Badge variant="outline" className="text-zinc-400">
                Rank #{crypto.cmc_rank}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {crypto.website?.length > 0 && (
                <a
                  href={crypto.website[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Globe size={14} />
                  Website
                  <ExternalLink size={12} />
                </a>
              )}
              {crypto.whitepaper?.length > 0 && (
                <a
                  href={crypto.whitepaper[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Whitepaper
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Price and Key Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Card */}
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <div className="flex items-baseline gap-4">
              <div className="text-4xl font-bold">
                ${crypto.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: crypto.current_price < 1 ? 6 : 2
                })}
              </div>
              <div className={`flex items-center gap-1 text-lg ${
                crypto.change_24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {crypto.change_24h >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h.toFixed(2)}%
                <span className="text-sm text-zinc-400">(24h)</span>
              </div>
            </div>
          </Card>

          {/* Price Chart */}
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-xl font-semibold">Price Chart</h3>
              <div className="flex items-center gap-3">
                {/* Save to Dashboard button */}
                <button
                  onClick={handleSaveToDashboard}
                  className="p-2 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                  title="Save to Dashboard"
                >
                  <BookmarkPlus className="w-5 h-5" />
                </button>

                {/* Chart Type Selector */}
                <div className="relative">
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as ChartType)}
                    className="appearance-none bg-zinc-800 text-zinc-200 px-4 py-2 pr-8 rounded text-sm border border-zinc-700 hover:bg-zinc-700 cursor-pointer"
                  >
                    <option value="line">Line Chart</option>
                    <option value="candle">Candlestick</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>

                {/* Time Period Buttons */}
                <div className="flex gap-2">
                  {(['1', '7', '30', '90', '180', '365'] as TimePeriod[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`px-3 py-1 text-sm rounded ${
                        timePeriod === period
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {period}D
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Line Chart */}
            {chartType === 'line' && historicalData?.status === 'success' && historicalData?.data?.prices ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData.data.prices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`,
                      'Price'
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleString()
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}

            {/* Candlestick Chart */}
            {chartType === 'candle' && ohlcData?.status === 'success' && ohlcData?.data?.ohlc ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={prepareOHLCData(ohlcData.data.ohlc)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'openClose') {
                        return [`O: $${value[0]} C: $${value[1]}`, 'OHLC']
                      }
                      return [value, name]
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleString()
                    }}
                  />
                  <Bar
                    dataKey="openClose"
                    fill="#8884d8"
                    shape={<Candlestick />}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : null}

            {/* Bar Chart */}
            {chartType === 'bar' && ohlcData?.status === 'success' && ohlcData?.data?.ohlc ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ohlcData.data.ohlc}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'close') return [`$${value.toLocaleString()}`, 'Close Price']
                      return [value, name]
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleString()
                    }}
                  />
                  <Bar dataKey="close" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : null}

            {/* Loading State */}
            {((chartType === 'line' && !historicalData?.data?.prices) ||
              ((chartType === 'candle' || chartType === 'bar') && !ohlcData?.data?.ohlc)) && (
              <div className="h-[300px] flex items-center justify-center text-zinc-400">
                Loading chart data...
              </div>
            )}
          </Card>

          {/* Price Changes */}
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <h3 className="text-xl font-semibold mb-4">Price Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-zinc-400">1 Hour</div>
                <div className={`text-lg font-medium ${
                  crypto.change_1h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {crypto.change_1h >= 0 ? '+' : ''}{crypto.change_1h.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">24 Hours</div>
                <div className={`text-lg font-medium ${
                  crypto.change_24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">7 Days</div>
                <div className={`text-lg font-medium ${
                  crypto.change_7d >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {crypto.change_7d >= 0 ? '+' : ''}{crypto.change_7d.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">30 Days</div>
                <div className={`text-lg font-medium ${
                  crypto.change_30d >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {crypto.change_30d >= 0 ? '+' : ''}{crypto.change_30d.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">60 Days</div>
                <div className={`text-lg font-medium ${
                  crypto.change_60d >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {crypto.change_60d >= 0 ? '+' : ''}{crypto.change_60d.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">90 Days</div>
                <div className={`text-lg font-medium ${
                  crypto.change_90d >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {crypto.change_90d >= 0 ? '+' : ''}{crypto.change_90d.toFixed(2)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Market Cap Chart */}
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Market Cap History</h3>
              <div className="text-sm text-zinc-400">
                Current: {formatMarketCap(crypto.market_cap)}
              </div>
            </div>
            {historicalData?.status === 'success' && historicalData?.data?.market_caps ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalData.data.market_caps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
                      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
                      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
                      return `$${value}`
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [
                      formatMarketCap(value),
                      'Market Cap'
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleString()
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="market_cap"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-zinc-400">
                Loading market cap data...
              </div>
            )}
          </Card>

          {/* Volume Chart */}
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Volume History (24h)</h3>
              <div className="text-sm text-zinc-400">
                Current: {formatMarketCap(crypto.volume_24h)}
              </div>
            </div>
            {historicalData?.status === 'success' && historicalData?.data?.volumes ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={historicalData.data.volumes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
                      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
                      return `$${value}`
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [
                      formatMarketCap(value),
                      '24h Volume'
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleString()
                    }}
                  />
                  <Bar dataKey="volume" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-zinc-400">
                Loading volume data...
              </div>
            )}
          </Card>

          {/* Description */}
          {crypto.description && (
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-xl font-semibold mb-4">About {crypto.name}</h3>
              <p className="text-zinc-300 leading-relaxed">{crypto.description}</p>
            </Card>
          )}
        </div>

        {/* Right Column - Market Stats */}
        <div className="space-y-6">
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <h3 className="text-xl font-semibold mb-4">Market Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-zinc-400">Market Cap</div>
                <div className="text-lg font-medium">
                  {formatMarketCap(crypto.market_cap)}
                </div>
                {crypto.market_cap_dominance && (
                  <div className="text-xs text-zinc-500">
                    {crypto.market_cap_dominance.toFixed(2)}% dominance
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-zinc-400">24h Volume</div>
                <div className="text-lg font-medium">
                  {formatMarketCap(crypto.volume_24h)}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-400">Fully Diluted Market Cap</div>
                <div className="text-lg font-medium">
                  {formatMarketCap(crypto.fully_diluted_market_cap)}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <div className="text-sm text-zinc-400">Circulating Supply</div>
                <div className="text-lg font-medium">
                  {formatSupply(crypto.circulating_supply)} {crypto.symbol}
                </div>
              </div>

              {crypto.total_supply && (
                <div>
                  <div className="text-sm text-zinc-400">Total Supply</div>
                  <div className="text-lg font-medium">
                    {formatSupply(crypto.total_supply)} {crypto.symbol}
                  </div>
                </div>
              )}

              {crypto.max_supply && (
                <div>
                  <div className="text-sm text-zinc-400">Max Supply</div>
                  <div className="text-lg font-medium">
                    {formatSupply(crypto.max_supply)} {crypto.symbol}
                  </div>
                  {crypto.circulating_supply && crypto.max_supply && (
                    <div className="mt-2">
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (crypto.circulating_supply / crypto.max_supply) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {((crypto.circulating_supply / crypto.max_supply) * 100).toFixed(2)}% in circulation
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500">
                  Last updated: {new Date(crypto.last_updated).toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

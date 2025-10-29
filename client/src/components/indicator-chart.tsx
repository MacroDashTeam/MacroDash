import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect, useState } from 'react'

async function fetchIndicatorData(indicatorKey: string) {
  const res = await fetch(`/api/economic-data/${indicatorKey}/`)
  if (!res.ok) throw new Error('Failed to fetch indicator data')
  return await res.json()
}

type IndicatorKey = 'DFF' | 'UNRATE' | 'CPIAUCSL' | 'GDP'

const INDICATOR_INFO: Record<IndicatorKey, { name: string; unit: string; color: string }> = {
  DFF: { name: 'Federal Funds Effective Rate', unit: '%', color: '#3b82f6' },
  UNRATE: { name: 'Unemployment Rate', unit: '%', color: '#ef4444' },
  CPIAUCSL: { name: 'Consumer Price Index', unit: 'Index', color: '#10b981' },
  GDP: { name: 'Gross Domestic Product', unit: 'Billions', color: '#f59e0b' },
}

export default function IndicatorChart({ onBack }: { onBack?: () => void }) {
  const [indicatorKey, setIndicatorKey] = useState<IndicatorKey | null>(null)

  useEffect(() => {
    // Listen for indicator navigation events
    const handleIndicatorNav = (e: CustomEvent) => {
      if (e.detail.indicator && INDICATOR_INFO[e.detail.indicator as IndicatorKey]) {
        setIndicatorKey(e.detail.indicator as IndicatorKey)
      }
    }

    window.addEventListener('navigate-indicator' as any, handleIndicatorNav)
    return () => window.removeEventListener('navigate-indicator' as any, handleIndicatorNav)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['economic-indicator', indicatorKey],
    queryFn: () => fetchIndicatorData(indicatorKey!),
    enabled: !!indicatorKey,
  })

  if (!indicatorKey) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">Invalid Indicator</h1>
          <p className="text-zinc-400 mt-2">Please specify a valid indicator parameter</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading historical data...</p>
        </div>
      </div>
    )
  }

  const indicatorData = data?.data

  if (!indicatorData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">No Data Available</h1>
          <p className="text-zinc-400 mt-2">Could not load data for {indicatorKey}</p>
        </div>
      </div>
    )
  }

  const info = INDICATOR_INFO[indicatorKey]
  const isPositive = indicatorData.change >= 0

  // Format historical data for the chart
  const chartData = indicatorData.historical.map((item: any) => ({
    date: item.date,
    value: item.value,
  }))

  // Calculate min and max for Y-axis
  const values = chartData.map((d: any) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.1

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{info.name}</h1>
              <p className="text-zinc-400 mt-1">Historical Time Series Data</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Current Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-sm text-zinc-400">Current Value</div>
              <div className="text-2xl font-bold font-mono mt-1">
                {indicatorData.current < 100
                  ? `${indicatorData.current.toFixed(2)}${info.unit === '%' ? '%' : ''}`
                  : indicatorData.current.toLocaleString('en-US', { maximumFractionDigits: 1 })}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-sm text-zinc-400">Change</div>
              <div className={`text-2xl font-bold font-mono mt-1 flex items-center gap-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {isPositive ? '+' : ''}{indicatorData.change_percent.toFixed(2)}%
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-sm text-zinc-400">Last Updated</div>
              <div className="text-lg font-semibold mt-1">
                {indicatorData.last_updated}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-semibold mb-6">Historical Trend</h2>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                tick={{ fill: '#71717a' }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                }}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#71717a' }}
                domain={[minValue - padding, maxValue + padding]}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                }}
                formatter={(value: number) => [
                  `${value.toFixed(2)}${info.unit === '%' ? '%' : ''}`,
                  info.name
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={info.color}
                strokeWidth={2}
                dot={false}
                name={info.name}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 text-sm text-zinc-500">
            Showing {chartData.length} data points from {chartData[0]?.date} to {chartData[chartData.length - 1]?.date}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold mb-3">About {info.name}</h3>
          <p className="text-zinc-400">
            {indicatorData.description}
          </p>
          <div className="mt-4 text-sm text-zinc-500">
            Data source: Federal Reserve Economic Data (FRED)
          </div>
        </div>
      </div>
    </div>
  )
}

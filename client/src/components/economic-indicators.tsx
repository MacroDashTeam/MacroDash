import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

async function fetchEconomicData() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const res = await fetch(`${API_BASE}/api/economic-data/`);

  if (!res.ok) throw new Error('Failed')
  return await res.json()
}

export default function EconomicIndicators() {
  const { data, isLoading } = useQuery({
    queryKey: ['economic'],
    queryFn: fetchEconomicData,
    refetchInterval: 300000,
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Economic Indicators</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Economic Indicators</h2>
        </div>
        <p className="text-red-400 text-sm">Loading economic data... (This may take 10-15 seconds)</p>
      </div>
    )
  }

  const indicators = [
    { key: 'DFF', data: data.data.DFF },
    { key: 'UNRATE', data: data.data.UNRATE },
    { key: 'CPIAUCSL', data: data.data.CPIAUCSL },
    { key: 'GDP', data: data.data.GDP },
  ].filter(item => item.data)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold">Economic Indicators</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map(({ key, data: item }) => {
          const isPositive = item.change >= 0
          const value = item.current < 100
            ? `${item.current.toFixed(2)}%`
            : item.current.toLocaleString('en-US', { maximumFractionDigits: 1 })

          return (
            <div
              key={key}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900/80 transition-colors cursor-pointer"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'indicator' } }))
                window.dispatchEvent(new CustomEvent('navigate-indicator', { detail: { indicator: key } }))
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">{item.description}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{key}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">{isPositive ? '+' : ''}{item.change_percent.toFixed(2)}%</span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-2xl font-bold font-mono">{value}</span>
              </div>

              <div className="text-xs text-zinc-500">
                Updated: {item.last_updated}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

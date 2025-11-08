import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Trash2, RefreshCw, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SavedChart {
  id: number
  chart_name: string
  series_ids: string[]
  series_metadata: Record<string, {
    name: string
    frequency: string
    units: string
  }>
  created_at: string
  last_viewed: string | null
}

interface ChartDataPoint {
  date: string
  [key: string]: any // Dynamic series values
}

interface ChartData {
  chart: SavedChart
  data: ChartDataPoint[]
}

async function fetchSavedCharts(): Promise<SavedChart[]> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const res = await fetch(`${API_BASE}/api/charts/`, {
    credentials: 'include' // Include cookies
  })
  if (!res.ok) throw new Error('Failed to fetch charts')
  const result = await res.json()
  return result.data || []
}

async function fetchChartData(chartId: number): Promise<ChartData> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const res = await fetch(`${API_BASE}/api/charts/${chartId}/data/`, {
    credentials: 'include' // Include cookies
  })
  if (!res.ok) throw new Error('Failed to fetch chart data')
  return await res.json()
}

async function deleteChart(chartId: number): Promise<void> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const res = await fetch(`${API_BASE}/api/charts/`, {
    method: 'DELETE',
    credentials: 'include', // Include cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chart_id: chartId })
  })
  if (!res.ok) throw new Error('Failed to delete chart')
}

// Generate distinct colors for each series
const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

function ChartCard({ chart }: { chart: SavedChart }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: chartData, isLoading, isError, refetch } = useQuery<ChartData>({
    queryKey: ['chart-data', chart.id],
    queryFn: () => fetchChartData(chart.id),
  })

  const handleDelete = async () => {
    if (!confirm(`Delete chart "${chart.chart_name}"?`)) return

    setIsDeleting(true)
    try {
      await deleteChart(chart.id)
      window.location.reload() // Refresh to update the list
    } catch (error) {
      console.error('Failed to delete chart:', error)
      alert('Failed to delete chart')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 border-zinc-800 bg-zinc-900/50">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-zinc-400">Loading chart data...</div>
        </div>
      </Card>
    )
  }

  if (isError || !chartData) {
    return (
      <Card className="p-6 border-zinc-800 bg-zinc-900/50">
        <div className="h-96 flex items-center justify-center">
          <div className="text-red-400">Failed to load chart data</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-zinc-800 bg-zinc-900/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-500" />
            {chart.chart_name}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(chart.created_at).toLocaleDateString()}
            </span>
            <span>{chart.series_ids.length} series</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-zinc-700"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-zinc-700 hover:border-red-500 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLine data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              tick={{ fill: '#71717a' }}
              tickFormatter={(value) => {
                // Format date to show year
                const date = new Date(value)
                return date.getFullYear().toString()
              }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fill: '#71717a' }}
              tickFormatter={(value) => {
                // Format numbers with abbreviations
                if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
                if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
                if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
                return value.toFixed(0)
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                color: '#fff'
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                }
                return value
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                // Show series name from metadata if available
                const metadata = chart.series_metadata[value]
                return metadata?.name || value
              }}
            />

            {/* Render a line for each series */}
            {chart.series_ids.map((seriesId, index) => (
              <Line
                key={seriesId}
                type="monotone"
                dataKey={seriesId}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                name={seriesId}
                connectNulls
              />
            ))}
          </RechartsLine>
        </ResponsiveContainer>
      </div>

      {/* Series Legend with Details */}
      <div className="mt-6 space-y-2">
        {chart.series_ids.map((seriesId, index) => {
          const metadata = chart.series_metadata[seriesId]
          return (
            <div
              key={seriesId}
              className="flex items-center gap-3 text-sm p-2 rounded hover:bg-zinc-800/50"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <div className="flex-1">
                <div className="font-medium text-zinc-200">{seriesId}</div>
                {metadata && (
                  <div className="text-xs text-zinc-500">
                    {metadata.name} • {metadata.frequency} • {metadata.units}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function ManageDisplay() {
  const { data: charts, isLoading, isError } = useQuery<SavedChart[]>({
    queryKey: ['saved-charts'],
    queryFn: fetchSavedCharts,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Display</h1>
          <p className="text-zinc-400 mt-2">Your saved multi-series charts</p>
        </div>

        <div className="space-y-6">
          {[1, 2].map(i => (
            <Card key={i} className="p-6 border-zinc-800 bg-zinc-900/50">
              <div className="h-96 animate-pulse bg-zinc-800/50 rounded" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Display</h1>
          <p className="text-zinc-400 mt-2">Your saved multi-series charts</p>
        </div>

        <Card className="p-6 border-zinc-800 bg-zinc-900/50">
          <p className="text-red-400">Failed to load saved charts</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manage Display</h1>
        <p className="text-zinc-400 mt-2">
          Your saved multi-series charts from Data Explorer
        </p>
      </div>

      {/* Charts */}
      {charts && charts.length > 0 ? (
        <div className="space-y-6">
          {charts.map(chart => (
            <ChartCard key={chart.id} chart={chart} />
          ))}
        </div>
      ) : (
        <Card className="p-12 border-zinc-800 bg-zinc-900/50 text-center">
          <LineChart className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-xl font-semibold mb-2">No Charts Yet</h3>
          <p className="text-zinc-400 mb-4">
            Go to Data Explorer and select 2+ series, then click "Add to Display" to create your first chart
          </p>
          <Button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'data-explorer' } }))
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Data Explorer
          </Button>
        </Card>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Trash2, RefreshCw, Calendar, GripVertical } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

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
  [key: string]: any
}

interface ChartData {
  chart: SavedChart
  data: ChartDataPoint[]
}

const API_BASE = import.meta.env.VITE_API_BASE_URL

async function fetchSavedCharts(): Promise<SavedChart[]> {
  const res = await fetch(`${API_BASE}/api/charts/`, {
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Failed to fetch charts')
  const result = await res.json()
  return result.data || []
}

async function fetchChartData(chartId: number): Promise<ChartData> {
  const res = await fetch(`${API_BASE}/api/charts/${chartId}/data/`, {
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Failed to fetch chart data')
  return await res.json()
}

async function deleteChart(chartId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/charts/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chart_id: chartId })
  })
  if (!res.ok) throw new Error('Failed to delete chart')
}

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
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete chart:', error)
      alert('Failed to delete chart')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full w-full p-6 border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading chart data...</div>
      </Card>
    )
  }

  if (isError || !chartData) {
    return (
      <Card className="h-full w-full p-6 border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
        <div className="text-red-400">Failed to load chart data</div>
      </Card>
    )
  }

  if (!chartData.data || chartData.data.length === 0) {
    return (
      <Card className="h-full w-full p-6 border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
        <div className="text-yellow-400">No data available for this chart</div>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full p-6 border-zinc-800 bg-zinc-900/50 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div className="flex-1 flex items-start gap-2">
          <GripVertical className="w-5 h-5 text-zinc-500 cursor-move drag-handle mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LineChart className="w-4 h-4 text-blue-500" />
              {chart.chart_name}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(chart.created_at).toLocaleDateString()}
              </span>
              <span>{chart.series_ids.length} series</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-zinc-700 h-8 w-8 p-0"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-zinc-700 hover:border-red-500 hover:text-red-500 h-8 w-8 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1" style={{ minHeight: '350px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLine data={chartData.data} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickFormatter={(value) => {
                try {
                  const date = new Date(value)
                  return date.getFullYear().toString()
                } catch (e) {
                  return value
                }
              }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickFormatter={(value) => {
                if (typeof value !== 'number') return value
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
              wrapperStyle={{ paddingTop: '10px' }}
              iconSize={10}
              formatter={(value) => {
                const metadata = chart.series_metadata?.[value]
                return metadata?.name || value
              }}
            />

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
                isAnimationActive={false}
              />
            ))}
          </RechartsLine>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default function ManageDisplay() {
  const { data: charts, isLoading, isError, refetch } = useQuery<SavedChart[]>({
    queryKey: ['saved-charts'],
    queryFn: fetchSavedCharts,
  })

  // Listen for chart-saved events to refresh
  useEffect(() => {
    const handleChartSaved = () => {
      refetch()
    }
    window.addEventListener('chart-saved', handleChartSaved)
    return () => window.removeEventListener('chart-saved', handleChartSaved)
  }, [refetch])

  const [layout, setLayout] = useState<any[]>([])

  // Initialize layout when charts load
  useEffect(() => {
    if (charts && charts.length > 0) {
      // Clear any old invalid layouts
      localStorage.removeItem('dashboard-layout')

      // Default layout: 2-column grid
      const defaultLayout = charts.map((chart, index) => ({
        i: chart.id.toString(),
        x: (index % 2) * 6,  // Alternates between 0 and 6 (left and right columns)
        y: Math.floor(index / 2) * 6,  // Stacks rows of 2
        w: 6,  // Half width (50% of 12 columns)
        h: 6,
        minW: 4,
        minH: 4,
      }))
      setLayout(defaultLayout)
    }
  }, [charts])

  const handleLayoutChange = (newLayout: any[]) => {
    setLayout(newLayout)
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 border-zinc-800 bg-zinc-900/50">
          <p className="text-red-400">Failed to load saved charts</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full px-6 py-6 space-y-6 mt-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-2">
            Your saved multi-series charts from Data Explorer and Custom Analysis
          </p>
        </div>

        {/* Charts Grid */}
        {charts && charts.length > 0 && layout.length > 0 ? (
          <div className="w-full">
            <ResponsiveGridLayout
              className="layout"
              layouts={{
                lg: layout,
                md: layout,
                sm: layout,
                xs: layout,
                xxs: layout
              }}
              onLayoutChange={handleLayoutChange}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
              rowHeight={80}
              draggableHandle=".drag-handle"
              isDraggable={true}
              isResizable={true}
              preventCollision={false}
              compactType="vertical"
              margin={[16, 16]}
              containerPadding={[0, 0]}
            >
              {charts.map(chart => (
                <div key={chart.id.toString()} style={{ width: '100%', height: '100%' }}>
                  <ChartCard chart={chart} />
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        ) : charts && charts.length === 0 ? (
          <Card className="p-12 border-zinc-800 bg-zinc-900/50 text-center">
            <LineChart className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-xl font-semibold mb-2">No Charts Yet</h3>
            <p className="text-zinc-400 mb-4">
              Create charts from Data Explorer or Custom Analysis to see them here
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'data-explorer' } }))
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Data Explorer
              </Button>
              <Button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'custom' } }))
                }}
                variant="outline"
                className="border-zinc-700"
              >
                Go to Custom Analysis
              </Button>
            </div>
          </Card>
        ) : (
          <div className="text-center text-zinc-400 py-12">Initializing layout...</div>
        )}
      </div>
    </div>
  )
}

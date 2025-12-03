import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BarChart3, X, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'

type SavedChart = {
  id: number
  chart_name: string
  series_ids: string[]
  series_metadata: Record<string, any>
  chart_type?: string
  show_legend?: boolean
  source_type?: string
  formulas?: any
  symbols?: string[]
  created_at: string
  updated_at: string
}

type SavedChartsResponse = {
  status: string
  data: SavedChart[]
  timestamp: string
}

async function fetchSavedCharts(): Promise<SavedChartsResponse> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const response = await fetch(`${API_BASE}/api/charts/`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch saved charts')
  }
  return response.json()
}

async function deleteChart(chartId: number): Promise<any> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const response = await fetch(`${API_BASE}/api/charts/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ chart_id: chartId })
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete chart')
  }
  return response.json()
}

export default function SavedCharts() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery<SavedChartsResponse>({
    queryKey: ['saved-charts'],
    queryFn: fetchSavedCharts,
    staleTime: 30000,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-charts'] })
    },
    onError: (error: Error) => {
      alert(error.message)
    }
  })

  const handleDelete = (chartId: number, chartName: string) => {
    if (confirm(`Delete "${chartName}"?`)) {
      deleteMutation.mutate(chartId)
    }
  }

  const handleViewChart = (chart: SavedChart) => {
    // Navigate to custom analysis page with the saved chart data
    window.dispatchEvent(new CustomEvent('navigate', { detail: { mode: 'custom-analysis' } }))
    // Store chart data for loading
    sessionStorage.setItem('loadChart', JSON.stringify(chart))
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold">Saved Charts</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
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
          <BarChart3 className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold">Saved Charts</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load saved charts</p>
      </div>
    )
  }

  const charts = data.data || []

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-zinc-400" />
        <h2 className="text-lg font-semibold">Saved Charts</h2>
        <span className="text-sm text-zinc-500">({charts.length})</span>
      </div>

      {charts.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="mb-2">No saved charts</p>
          <p className="text-sm">Create custom charts in the Data Explorer</p>
        </div>
      ) : (
        <div className="space-y-2">
          {charts.map((chart) => (
            <div
              key={chart.id}
              className="group relative flex items-center justify-between p-4 rounded-lg hover:bg-zinc-800/50 transition-colors border border-zinc-800/50"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(chart.id, chart.chart_name)
                }}
                className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded p-1"
                title="Delete chart"
              >
                <X className="w-4 h-4" />
              </button>

              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleViewChart(chart)}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <h3 className="font-medium text-zinc-200">{chart.chart_name}</h3>
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {chart.source_type === 'custom_analysis' && (
                    <span>Custom Analysis • </span>
                  )}
                  {chart.series_ids.length} series
                  {chart.symbols && chart.symbols.length > 0 && (
                    <span> • Stocks: {chart.symbols.join(', ')}</span>
                  )}
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  Created {new Date(chart.created_at).toLocaleDateString()}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewChart(chart)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Play, Trash2, Calculator, TrendingUp, TrendingDown, Database, Save, X, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'
import { findExtrema, fetchMarketInsight } from '@/lib/utils'
import type { ExtremaPoint } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Series = {
  id: string
  label: string
  source: string
  show: boolean
  formula?: string
  color: string
}

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

const PRESET_FUNCTIONS = [
  { name: 'SMA', description: 'Simple Moving Average', example: 'sma(AAPL, 20)' },
  { name: 'EMA', description: 'Exponential Moving Average', example: 'ema(AAPL, 20)' },
  { name: 'Returns', description: 'Calculate returns', example: 'returns(AAPL)' },
  { name: 'Quantile', description: 'Calculate percentile (scalar)', example: 'quantile(AAPL, 0.25)' },
  { name: 'ADF Test', description: 'Stationarity test (dict result)', example: 'adf_test(AAPL)' },
  { name: 'ARIMA', description: 'ARIMA forecast (slow, 30-60s)', example: 'arima(AAPL, [1,1,1])' },
  { name: 'ARIMA Auto', description: 'Auto-find best ARIMA params (2-3 min)', example: 'arima_auto(AAPL)' },
]

// Convert formula to LaTeX notation
function formulaToLatex(formula: string): string {
  if (!formula) return ''

  let latex = formula

  // Handle sma(AAPL, 20) -> \text{SMA}_{20}(\text{AAPL})
  latex = latex.replace(/sma\(([^,]+),\s*(\d+)\)/g, (_, symbol, period) =>
    `\\text{SMA}_{${period}}(\\text{${symbol.trim()}})`
  )

  // Handle ema(AAPL, 20) -> \text{EMA}_{20}(\text{AAPL})
  latex = latex.replace(/ema\(([^,]+),\s*(\d+)\)/g, (_, symbol, period) =>
    `\\text{EMA}_{${period}}(\\text{${symbol.trim()}})`
  )

  // Handle returns(AAPL) -> R(\text{AAPL})
  latex = latex.replace(/returns\(([^)]+)\)/g, (_, symbol) =>
    `R(\\text{${symbol.trim()}})`
  )

  // Handle adf_test(AAPL) -> \text{ADF}(\text{AAPL})
  latex = latex.replace(/adf_test\(([^)]+)\)/g, (_, symbol) =>
    `\\text{ADF}(\\text{${symbol.trim()}})`
  )

  // Handle arima_auto(AAPL) -> \text{ARIMA-AUTO}(\text{AAPL})
  latex = latex.replace(/arima_auto\(([^)]+)\)/g, (_, symbol) =>
    `\\text{ARIMA-AUTO}(\\text{${symbol.trim()}})`
  )

  // Handle arima(AAPL, [1,1,1]) -> \text{ARIMA}_{(1,1,1)}(\text{AAPL})
  latex = latex.replace(/arima\(([^,]+),\s*\[([^\]]+)\]\)/g, (_, symbol, order) =>
    `\\text{ARIMA}_{(${order})}(\\text{${symbol.trim()}})`
  )

  // Handle quantile(AAPL, 0.25) -> Q_{0.25}(\text{AAPL})
  latex = latex.replace(/quantile\(([^,]+),\s*([\d\.]+)\)/g, (_, symbol, q) =>
    `Q_{${q}}(\\text{${symbol.trim()}})`
  )

  // Handle price(AAPL) -> \text{price}(\text{AAPL})
  latex = latex.replace(/price\(([^)]+)\)/g, (_, symbol) =>
    `\\text{price}(\\text{${symbol.trim()}})`
  )

  // Handle plain symbols (stock tickers like AAPL)
  // Only if not already wrapped in \text{}
  if (!latex.includes('\\text{')) {
    latex = `\\text{${latex}}`
  }

  return latex
}

export default function CustomAnalysis() {
  const [series, setSeries] = useState<Series[]>([
    { id: 'AAPL', label: 'AAPL', source: 'NASDAQ: AAPL', show: false, color: CHART_COLORS[0] },
    { id: 'MSFT', label: 'MSFT', source: 'NASDAQ: MSFT', show: false, color: CHART_COLORS[1] },
    { id: 'BTC-USD', label: 'BTC-USD', source: 'Crypto: Bitcoin', show: false, color: CHART_COLORS[2] },
    { id: 'GC=F', label: 'GOLD', source: 'Commodities: Gold Futures', show: false, color: CHART_COLORS[3] },
    { id: 'SI=F', label: 'SILVER', source: 'Commodities: Silver Futures', show: false, color: CHART_COLORS[4] },
    { id: 'DX-Y.NYB', label: 'DXY', source: 'Index: US Dollar Index', show: false, color: CHART_COLORS[5] },
  ])

  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [staticVars, setStaticVars] = useState<any>(null)
  const [useLogScale, setUseLogScale] = useState(false)

  // Modals
  const [showAddStock, setShowAddStock] = useState(false)
  const [showAddFunction, setShowAddFunction] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Form inputs
  const [newStockSymbol, setNewStockSymbol] = useState('')
  const [newFunctionName, setNewFunctionName] = useState('')
  const [newFunctionFormula, setNewFunctionFormula] = useState('')
  const [chartName, setChartName] = useState('')
  const [saving, setSaving] = useState(false)

  // Extrema insight state
  const [selectedExtrema, setSelectedExtrema] = useState<ExtremaPoint & { seriesLabel: string } | null>(null)
  const [insightDialogOpen, setInsightDialogOpen] = useState(false)
  const [insight, setInsight] = useState<string>('')
  const [insightLoading, setInsightLoading] = useState(false)

  // Memoize visible series to prevent chart re-renders on every keystroke
  const visibleSeries = useMemo(() => series.filter(s => s.show), [series])

  // Calculate extrema points for all visible series
  const allExtremaPoints = useMemo(() => {
    if (!chartData || chartData.length < 7) return []

    const points: (ExtremaPoint & { seriesLabel: string; color: string })[] = []

    visibleSeries.forEach((s) => {
      // Map chartData to expected format for this series
      const mappedData = chartData
        .filter((d) => d[s.label] != null)
        .map((d) => ({
          date: d.date,
          value: d[s.label] as number,
        }))

      if (mappedData.length < 7) return

      const windowSize = Math.min(3, Math.floor(mappedData.length / 5))
      const extrema = findExtrema(mappedData, 'value', windowSize, 0.5)

      extrema.forEach((e) => {
        points.push({
          ...e,
          seriesLabel: s.label,
          color: s.color,
        })
      })
    })

    return points
  }, [chartData, visibleSeries])

  // Handle click on extrema point
  const handleExtremaClick = async (extrema: ExtremaPoint & { seriesLabel: string }) => {
    setSelectedExtrema(extrema)
    setInsightDialogOpen(true)
    setInsightLoading(true)
    setInsight('')

    try {
      const result = await fetchMarketInsight(
        extrema.date,
        extrema.seriesLabel,
        extrema.changePercent,
        extrema.isPeak
      )

      if (result.status === 'success') {
        setInsight(result.insight)
      } else {
        setInsight(result.error || 'Unable to fetch insight')
      }
    } catch {
      setInsight('Failed to fetch market insight. Please try again.')
    } finally {
      setInsightLoading(false)
    }
  }

  const handleToggleSeries = (id: string) => {
    setSeries(series.map(s => s.id === id ? { ...s, show: !s.show } : s))
  }

  const handleDeleteSeries = (id: string) => {
    setSeries(series.filter(s => s.id !== id))
  }

  const handleAddStock = () => {
    const symbol = newStockSymbol.trim().toUpperCase()
    if (!symbol) {
      alert('Please enter a stock symbol')
      return
    }
    if (series.find(s => s.id === symbol)) {
      alert('Stock already added')
      return
    }

    setSeries([...series, {
      id: symbol,
      label: symbol,
      source: `Stock: ${symbol}`,
      show: true,
      color: CHART_COLORS[series.length % CHART_COLORS.length]
    }])
    setNewStockSymbol('')
    setShowAddStock(false)
  }

  const handleAddFunction = () => {
    if (!newFunctionName.trim() || !newFunctionFormula.trim()) {
      alert('Please enter both name and formula')
      return
    }

    setSeries([...series, {
      id: `custom_${Date.now()}`,
      label: newFunctionName,
      source: newFunctionFormula,
      formula: newFunctionFormula,
      show: true,
      color: CHART_COLORS[series.length % CHART_COLORS.length]
    }])
    setNewFunctionName('')
    setNewFunctionFormula('')
    setShowAddFunction(false)
  }

  const handleAddPreset = (preset: typeof PRESET_FUNCTIONS[0]) => {
    setSeries([...series, {
      id: `preset_${Date.now()}`,
      label: preset.name,
      source: preset.example,
      formula: preset.example,
      show: true,
      color: CHART_COLORS[series.length % CHART_COLORS.length]
    }])
  }

  const handleRunAnalysis = async () => {
    const selectedSeries = visibleSeries
    if (selectedSeries.length === 0) {
      alert('Please select at least one series')
      return
    }

    setLoading(true)
    try {
      // Collect all symbols that are needed
      const allSymbols = new Set<string>()

      // Build formulas - create price() formulas for plain stocks
      const formulas: Record<string, string> = {}

      selectedSeries.forEach(s => {
        if (s.formula) {
          // Custom formula - extract symbols from it
          formulas[s.label] = s.formula
          // Extract symbols from formula - handle special chars like =, -, .
          // Match patterns like: AAPL, BTC-USD, GC=F, DX-Y.NYB
          // Must start with a letter to be a valid symbol (not a number like "20")
          const symbolMatches = s.formula.match(/\b[A-Z][A-Z0-9]*(?:[-=\.][A-Z0-9]+)*\b/g)
          if (symbolMatches) {
            symbolMatches.forEach(sym => {
              // Filter out function names (like SMA, EMA, QUANTILE, etc.)
              if (!['SMA', 'EMA', 'RETURNS', 'ADF', 'ARIMA', 'PRICE', 'QUANTILE', 'TEST'].includes(sym.toUpperCase())) {
                allSymbols.add(sym)
              }
            })
          }
        } else {
          // Plain stock - create a price() formula
          formulas[s.label] = `price(${s.id})`
          allSymbols.add(s.id)
        }
      })

      const API_BASE = import.meta.env.VITE_API_BASE_URL

      // Convert formulas dict to list of "label = expression" strings
      const formulasList = Object.entries(formulas).map(([label, expr]) => `${label} = ${expr}`)

      console.log('Sending to API:', {
        symbols: Array.from(allSymbols),
        formulas: formulasList
      })

      const response = await fetch(`${API_BASE}/api/custom-analysis/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: Array.from(allSymbols),
          formulas: formulasList
        }),
        signal: AbortSignal.timeout(120000)  // 2 minute timeout for ARIMA calculations
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Analysis failed: ${errorText}`)
      }

      const result = await response.json()
      console.log('API Result:', result)
      console.log('API Result data keys:', Object.keys(result.data || result))
      console.log('API Result data:', result.data)

      // Build chart data - handle both result.data and direct result
      const chartPoints: any[] = []
      const dataObj = result.data || result

      // Filter out non-time-series results (like ADF test which returns dict, or quantile which returns scalar)
      const timeSeriesData: any = {}
      const statisticalResults: any = {}
      Object.entries(dataObj).forEach(([key, value]: [string, any]) => {
        // Include results that have a series field (time series or forecast data) and are NOT scalar
        if (value.series && Array.isArray(value.series) && !value.scalar) {
          timeSeriesData[key] = value
        } else if (value.type === 'dict') {
          console.log(`Storing dict result for ${key}:`, value.data || value.value)
          statisticalResults[key] = value.data || value.value || value
        } else if (value.type === 'scalar') {
          console.log(`Storing scalar result for ${key}:`, value)
          statisticalResults[key] = value  // Store the whole object for scalar results
        }
      })

      // Store statistical results
      console.log('Statistical results to display:', statisticalResults)
      console.log('Number of statistical results:', Object.keys(statisticalResults).length)
      setStaticVars(Object.keys(statisticalResults).length > 0 ? statisticalResults : null)

      // Collect all unique dates from all time series (including forecasts)
      const allDates = new Set<string>()
      Object.values(timeSeriesData).forEach((value: any) => {
        if (value.dates) {
          value.dates.forEach((date: string) => allDates.add(date))
        }
      })

      // Sort dates chronologically
      const sortedDates = Array.from(allDates).sort((a, b) => {
        // Handle T+N format for forecast dates without historical dates
        if (a.startsWith('T+') && b.startsWith('T+')) {
          return parseInt(a.substring(2)) - parseInt(b.substring(2))
        }
        if (a.startsWith('T+')) return 1
        if (b.startsWith('T+')) return -1
        return new Date(a).getTime() - new Date(b).getTime()
      })

      // Build chart data with all dates
      sortedDates.forEach((date: string) => {
        const point: any = { date }

        // Add all series data for this date
        Object.entries(timeSeriesData).forEach(([key, value]: [string, any]) => {
          const dateIndex = value.dates?.indexOf(date)
          if (dateIndex !== undefined && dateIndex >= 0 && value.series) {
            point[key] = value.series[dateIndex]
          } else {
            // Use null for dates where this series doesn't have data
            point[key] = null
          }
        })

        chartPoints.push(point)
      })

      console.log('Chart data points:', chartPoints.length, chartPoints.slice(0, 3))

      // Log min/max values for each series to help debug scale issues
      if (chartPoints.length > 0) {
        Object.keys(chartPoints[0]).forEach(key => {
          if (key !== 'date') {
            const values = chartPoints.map(p => p[key]).filter(v => v != null && !isNaN(v))
            if (values.length > 0) {
              console.log(`${key}: min=${Math.min(...values)}, max=${Math.max(...values)}, count=${values.length}`)
            }
          }
        })
      }

      if (chartPoints.length === 0) {
        alert('No plottable data returned. Note: ADF Test, ARIMA, and Quantile return statistical results, not time series data.')
      }

      setChartData(chartPoints)
    } catch (error) {
      console.error('Analysis error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        alert('Analysis timed out. ARIMA calculations can take 1-2 minutes for large datasets. Please try with a smaller period or simpler model.')
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        alert('Network error: Unable to connect to server. Please check if the backend is running.')
      } else {
        alert(`Failed to run analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToDashboard = async () => {
    if (!chartName.trim()) {
      alert('Please enter a chart name')
      return
    }

    if (chartData.length === 0) {
      alert('Please run analysis first')
      return
    }

    setSaving(true)
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL
      const selectedSeries = visibleSeries
      const seriesIds = selectedSeries.map(s => s.label)
      const seriesMetadata = selectedSeries.reduce((acc, s) => {
        acc[s.label] = {
          name: s.label,
          frequency: 'Daily',
          units: s.formula ? 'Custom' : 'Price'
        }
        return acc
      }, {} as Record<string, any>)

      // Collect formulas for re-execution in Dashboard
      const formulas = selectedSeries.map(s => {
        if (s.formula) {
          return `${s.label} = ${s.formula}`
        } else {
          // Base stock price series
          return `${s.label} = price(${s.id})`
        }
      })

      // Extract unique stock symbols needed
      const symbolsSet = new Set<string>()
      selectedSeries.forEach(s => {
        if (s.formula) {
          // Extract symbols from formula (e.g., "sma(AAPL, 20)" -> "AAPL")
          const matches = s.formula.match(/([A-Z]{1,5})(?=[,)])/g)
          if (matches) {
            matches.forEach(sym => symbolsSet.add(sym))
          }
        } else {
          // Base stock symbol (no formula)
          symbolsSet.add(s.id)
        }
      })
      const symbols = Array.from(symbolsSet)

      const res = await fetch(`${API_BASE}/api/charts/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart_name: chartName,
          series_ids: seriesIds,
          series_metadata: seriesMetadata,
          source_type: 'custom_analysis',
          formulas: formulas,
          symbols: symbols
        })
      })

      if (!res.ok) throw new Error('Failed to save chart')

      // Dispatch event to notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('chart-saved'))

      alert('Chart saved to Dashboard successfully!')
      setChartName('')
      setShowSaveDialog(false)
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save chart to Dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 pt-12 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Analysis</h1>
          <p className="text-sm text-zinc-400 mt-1">Create custom formulas with SMA, EMA, ARIMA and more</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            onClick={handleRunAnalysis}
            disabled={loading || visibleSeries.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowSaveDialog(true)}
            disabled={chartData.length === 0}
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            Save to Dashboard
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 border border-zinc-800 rounded-md bg-zinc-900/50">
            <Checkbox
              id="log-scale"
              checked={useLogScale}
              onCheckedChange={(checked) => setUseLogScale(checked as boolean)}
            />
            <label
              htmlFor="log-scale"
              className="text-sm font-medium cursor-pointer text-zinc-300"
            >
              Log Scale
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Series */}
        <Card className="col-span-3 p-4 border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Series</h2>
            <span className="text-xs text-zinc-500">{visibleSeries.length} selected</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
            {series.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-zinc-800/50 group"
              >
                <Checkbox
                  checked={s.show}
                  onCheckedChange={() => handleToggleSeries(s.id)}
                />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.label}</div>
                  <div className="text-xs text-zinc-500 truncate">
                    {s.formula ? (
                      <InlineMath math={formulaToLatex(s.formula)} />
                    ) : (
                      s.source
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSeries(s.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddStock(true)}
              className="w-full text-xs"
            >
              <Database className="w-3 h-3 mr-1" />
              Add Stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddFunction(true)}
              className="w-full text-xs"
            >
              <Calculator className="w-3 h-3 mr-1" />
              Add Formula
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-semibold mb-2 text-zinc-400">Preset Functions</h3>
            <div className="space-y-1">
              {PRESET_FUNCTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(preset)}
                  className="w-full text-left p-2 rounded hover:bg-zinc-800 text-xs"
                >
                  <div className="font-semibold text-blue-400">{preset.name}</div>
                  <div className="text-zinc-500 text-[10px]">{preset.description}</div>
                  <div className="mt-1 text-zinc-600">
                    <InlineMath math={formulaToLatex(preset.example)} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Center Panel - Chart */}
        <Card className="col-span-9 p-6 border-zinc-800 bg-zinc-900/50">
          <h2 className="font-semibold mb-4">Chart</h2>

          {chartData.length > 0 ? (
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    scale={useLogScale ? 'log' : 'auto'}
                    domain={useLogScale ? ['auto', 'auto'] : ['auto', 'auto']}
                    allowDataOverflow={false}
                    tickFormatter={(value) => {
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                      if (value >= 1) return value.toFixed(0)
                      return value.toFixed(2)
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  {visibleSeries.map((s) => {
                    // Style forecast lines differently (dashed)
                    const isForecast = s.label.endsWith('_forecast')
                    return (
                      <Line
                        key={s.id}
                        type="monotone"
                        dataKey={s.label}
                        stroke={s.color}
                        strokeWidth={isForecast ? 2 : 2}
                        strokeDasharray={isForecast ? "5 5" : undefined}
                        dot={false}
                        connectNulls
                      />
                    )
                  })}
                  {/* Extrema point markers */}
                  {allExtremaPoints.map((extrema, idx) => (
                    <ReferenceDot
                      key={`extrema-${idx}`}
                      x={extrema.date}
                      y={extrema.value}
                      r={5}
                      fill={extrema.isPeak ? '#f59e0b' : '#8b5cf6'}
                      stroke="#fff"
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleExtremaClick(extrema)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select series and click "Run Analysis"</p>
                <p className="text-sm mt-2">Available functions: sma(), ema(), returns(), quantile(), adf_test(), arima(), arima_auto()</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Static Variables Panel */}
      {(() => {
        console.log('Rendering check - staticVars:', staticVars)
        console.log('Should render panel:', staticVars && Object.keys(staticVars).length > 0)
        return null
      })()}
      {staticVars && Object.keys(staticVars).length > 0 && (
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-zinc-100">
              <Database className="w-6 h-6" />
              Statistical Results
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {Object.entries(staticVars).map(([key, value]: [string, any]) => {
                console.log(`Rendering card for ${key}:`, value)
                console.log(`Value type check: typeof=${typeof value}, isNull=${value === null}, type field=${value?.type}`)
                return (
                <div key={key} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5 hover:border-zinc-600 transition-colors">
                  <div className="mb-4 pb-3 border-b border-zinc-700">
                    <h4 className="font-semibold text-base text-blue-400">{key}</h4>
                  </div>
                  <div className="space-y-2.5">
                    {/* Check if it's a scalar result (quantile, etc.) */}
                    {typeof value === 'object' && value !== null && value.type === 'scalar' ? (
                      <div className="text-center py-4">
                        <div className="text-4xl font-bold text-blue-400 mb-2">
                          {typeof value.value === 'number' ? value.value.toFixed(4) : String(value.value)}
                        </div>
                        {value.formula && (
                          <div className="text-xs text-zinc-500 mt-2">{value.formula}</div>
                        )}
                      </div>
                    ) : typeof value === 'object' && value !== null ? (
                      /* Handle dict results (ADF test, ARIMA, etc.) */
                      Object.entries(value).map(([k, v]: [string, any]) => (
                        <div key={k} className="flex justify-between items-start gap-4 py-1">
                          <span className="text-zinc-400 text-sm font-medium min-w-[120px]">{k}:</span>
                          <span className="text-zinc-100 font-mono text-sm text-right flex-1">
                            {typeof v === 'number'
                              ? v.toFixed(4)
                              : Array.isArray(v)
                              ? <span className="text-zinc-400 italic text-xs">Array ({v.length} values)</span>
                              : typeof v === 'object' && v !== null
                              ? Object.entries(v).map(([nk, nv]: [string, any]) => (
                                  <div key={nk} className="text-xs mb-1">
                                    <span className="text-zinc-500">{nk}: </span>
                                    <span className="text-zinc-300">{typeof nv === 'number' ? nv.toFixed(4) : String(nv)}</span>
                                  </div>
                                ))
                              : String(v)}
                          </span>
                        </div>
                      ))
                    ) : (
                      /* Handle primitive values */
                      <div className="text-zinc-200 text-sm">{String(value)}</div>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          </Card>
        )}

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddStock(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Stock</h3>
              <button onClick={() => setShowAddStock(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Input
              placeholder="Enter stock symbol (e.g., TSLA)"
              value={newStockSymbol}
              onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
              className="mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddStock(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddStock} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Function Modal */}
      {showAddFunction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddFunction(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Custom Formula</h3>
              <button onClick={() => setShowAddFunction(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Formula Name</label>
                <Input
                  placeholder="e.g., AAPL SMA 20"
                  value={newFunctionName}
                  onChange={(e) => setNewFunctionName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Formula</label>
                <Input
                  placeholder="e.g., sma(AAPL, 20)"
                  value={newFunctionFormula}
                  onChange={(e) => setNewFunctionFormula(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFunction()}
                />
              </div>
              <div className="text-xs text-zinc-500">
                Available: sma(symbol, period), ema(symbol, period), returns(symbol), adf_test(symbol), arima(symbol, [p,d,q])
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddFunction(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddFunction} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Add Formula
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save to Dashboard Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Save to Dashboard</h3>
              <button onClick={() => setShowSaveDialog(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Chart Name</label>
                <Input
                  placeholder="e.g., AAPL SMA Analysis"
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveToDashboard()}
                  autoFocus
                />
              </div>
              <div className="text-xs text-zinc-500">
                This will save {visibleSeries.length} series to your Dashboard
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveToDashboard} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Market Insight Dialog */}
      <Dialog open={insightDialogOpen} onOpenChange={setInsightDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedExtrema?.isPeak ? (
                <TrendingUp className="w-5 h-5 text-amber-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-purple-500" />
              )}
              <span>
                {selectedExtrema?.isPeak ? 'Peak' : 'Trough'} in {selectedExtrema?.seriesLabel} on{' '}
                {selectedExtrema && new Date(selectedExtrema.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedExtrema && (
                <span className={selectedExtrema.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {selectedExtrema.changePercent >= 0 ? '+' : ''}
                  {selectedExtrema.changePercent.toFixed(2)}% change
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {insightLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <span className="ml-2 text-zinc-400">Fetching insight...</span>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <p className="text-sm text-zinc-300 leading-relaxed">{insight}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

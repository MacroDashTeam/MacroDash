import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Play, TrendingUp, AlertCircle, CheckCircle2, Loader2, Search } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
type Stock = {
  symbol: string
  name: string
}

type Formula = {
  id: string
  expression: string
  result?: any
  error?: string
}

type AnalysisResult = {
  [key: string]: {
    formula: string
    value: any
    type: string
    error?: string
    series?: number[]
    dates?: string[]
    data?: {
      summary?: string
      is_stationary?: boolean
      trend?: string
      explanation?: string
      recommendation?: string
      model_quality?: string
      quality_note?: string
      forecast_range?: string
      suggested_action?: string
      [key: string]: any
    }
  }
}

export default function CustomAnalysis() {
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' }
  ])
  const [stockInput, setStockInput] = useState('')
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([])
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
  const [showStockDropdown, setShowStockDropdown] = useState(false)
  const [formulas, setFormulas] = useState<Formula[]>([
    { id: '1', expression: 'x = price(AAPL) / price(MSFT)' },
    { id: '2', expression: 'y = x^2 + 2' }
  ])
  const [formulaInput, setFormulaInput] = useState('')
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const availableFunctions = [
    'price(symbol)',
    'sma(series, period)',
    'ema(series, period)',
    'adf_test(series)',
    'arima(series, [p,d,q])',
    'returns(series)'
  ]

  // Fetch available stocks
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/stocks/')
        const data = await response.json()
        if (data.status === 'success' && data.data) {
          const stocks = Object.entries(data.data).map(([symbol, info]: [string, any]) => ({
            symbol,
            name: info.name || symbol
          }))
          setAvailableStocks(stocks)
        }
      } catch (err) {
        console.error('Failed to fetch stocks:', err)
      }
    }
    fetchStocks()
  }, [])

  const handleStockInputChange = (value: string) => {
    setStockInput(value)
    if (value.trim()) {
      const filtered = availableStocks.filter(stock =>
        stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
        stock.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10)
      setFilteredStocks(filtered)
      setShowStockDropdown(true)
    } else {
      setFilteredStocks([])
      setShowStockDropdown(false)
    }
  }

  const addStock = (stock?: Stock) => {
    let stockToAdd: Stock | undefined

    if (stock) {
      stockToAdd = stock
    } else if (stockInput.trim()) {
      const symbol = stockInput.toUpperCase()
      stockToAdd = availableStocks.find(s => s.symbol === symbol) || { symbol, name: '' }
    }

    if (stockToAdd && !selectedStocks.find(s => s.symbol === stockToAdd!.symbol)) {
      setSelectedStocks([...selectedStocks, stockToAdd])
    }

    setStockInput('')
    setShowStockDropdown(false)
    setFilteredStocks([])
  }

  const removeStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(s => s.symbol !== symbol))
  }

  const addFormula = () => {
    if (formulaInput.trim()) {
      setFormulas([...formulas, {
        id: Date.now().toString(),
        expression: formulaInput
      }])
      setFormulaInput('')
      setSuggestions([])
    }
  }

  const removeFormula = (id: string) => {
    setFormulas(formulas.filter(f => f.id !== id))
  }

  const handleFormulaInputChange = (value: string) => {
    setFormulaInput(value)

    // Simple autocomplete for functions
    if (value.includes('(') && !value.endsWith(')')) {
      const matches = availableFunctions.filter(fn =>
        fn.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(matches.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }

  const runAnalysis = async () => {
    if (selectedStocks.length === 0) {
      setError('Please add at least one stock')
      return
    }

    if (formulas.length === 0) {
      setError('Please add at least one formula')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/custom-analysis/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: selectedStocks.map(s => s.symbol),
          formulas: formulas.map(f => f.expression),
          period: '1y'
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        setResults(data.data)
      } else {
        setError(data.error || 'Failed to evaluate formulas')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to connect to the server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Custom Analysis</h1>
            <p className="text-zinc-400">
              Create custom formulas using stock data and statistical functions
            </p>
          </div>
          <Button onClick={runAnalysis} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-900/20 border-red-800">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Stock Selection */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Select Stocks</h2>
          </div>

          <div className="relative">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  value={stockInput}
                  onChange={(e) => handleStockInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addStock()}
                  onFocus={() => stockInput && setShowStockDropdown(true)}
                  placeholder="Search stocks (e.g., AAPL, Apple)"
                  className="pl-10 bg-zinc-800 border-zinc-700"
                />
              </div>
              <Button onClick={() => addStock()} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {/* Dropdown */}
            {showStockDropdown && filteredStocks.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => addStock(stock)}
                    className="w-full px-4 py-3 text-left hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-blue-400">{stock.symbol}</div>
                      <div className="text-sm text-zinc-500">{stock.name}</div>
                    </div>
                    <Plus className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedStocks.map(stock => (
              <div
                key={stock.symbol}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700"
              >
                <span className="font-mono font-semibold text-blue-400">{stock.symbol}</span>
                {stock.name && <span className="text-sm text-zinc-500">{stock.name}</span>}
                <button
                  onClick={() => removeStock(stock.symbol)}
                  className="ml-2 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Formula Editor */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-lg font-semibold mb-4">Formulas</h2>

          <div className="relative">
            <div className="flex gap-2 mb-2">
              <Input
                value={formulaInput}
                onChange={(e) => handleFormulaInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFormula()}
                placeholder="Enter formula (e.g., x = price(AAPL) / price(MSFT))"
                className="flex-1 bg-zinc-800 border-zinc-700 font-mono"
              />
              <Button onClick={addFormula} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFormulaInput(suggestion)
                      setSuggestions([])
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-mono text-zinc-300 hover:bg-zinc-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            {formulas.map(formula => (
              <div
                key={formula.id}
                className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
              >
                <span className="flex-1 font-mono text-sm text-zinc-200">{formula.expression}</span>
                <button
                  onClick={() => removeFormula(formula.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Function Reference */}
          <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Available Functions:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
              <div><code className="text-blue-400">price(symbol)</code> - Get price data</div>
              <div><code className="text-blue-400">sma(series, period)</code> - Simple moving average</div>
              <div><code className="text-blue-400">ema(series, period)</code> - Exponential moving average</div>
              <div><code className="text-blue-400">adf_test(series)</code> - Stationarity test</div>
              <div><code className="text-blue-400">arima(series, [p,d,q])</code> - ARIMA model</div>
              <div><code className="text-blue-400">returns(series)</code> - Calculate returns</div>
            </div>
          </div>
        </Card>

        {/* Results Area */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-lg font-semibold mb-4">Results</h2>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-zinc-400">Evaluating formulas...</p>
            </div>
          ) : results ? (
            <div className="space-y-6">
              {/* Combined Time Series Chart */}
              {(() => {
                // Check if we have any time series data
                const timeSeriesVars = Object.entries(results).filter(
                  ([, result]) => result.series && result.dates && result.series.length > 1 && !result.error
                )

                if (timeSeriesVars.length > 0) {
                  // Get dates from first variable (all should have same dates)
                  const dates = timeSeriesVars[0][1].dates || []

                  // Build combined data
                  const chartData = dates.map((date: string, idx: number) => {
                    const dataPoint: any = { date }
                    timeSeriesVars.forEach(([key, result]) => {
                      dataPoint[key] = result.series?.[idx]
                    })
                    return dataPoint
                  })

                  // Color palette for different variables
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

                  return (
                    <div>
                      <div className="text-sm text-zinc-500 mb-2">Time Series Chart:</div>
                      <div className="bg-zinc-900 rounded p-4">
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis
                              dataKey="date"
                              stroke="#71717a"
                              tick={{ fill: '#71717a', fontSize: 11 }}
                              tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              }}
                            />
                            <YAxis
                              stroke="#71717a"
                              tick={{ fill: '#71717a', fontSize: 11 }}
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
                              formatter={(value: number) => value.toFixed(4)}
                            />
                            <Legend />
                            {timeSeriesVars.map(([key], idx) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={key}
                                stroke={colors[idx % colors.length]}
                                strokeWidth={2}
                                dot={false}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Variable Summary */}
              <div>
                <div className="text-sm text-zinc-500 mb-3">Variable Summary:</div>
                <div className="grid gap-3">
                  {Object.entries(results).map(([key, result]) => (
                    <div
                      key={key}
                      className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                    >
                      <div className="flex items-start gap-3">
                        {result.error ? (
                          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-blue-400">{key}</span>
                            <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-700 rounded">
                              {result.type}
                            </span>
                          </div>
                          <div className="font-mono text-sm text-zinc-400 mb-2">
                            {result.formula}
                          </div>
                          {result.error ? (
                            <div className="text-sm text-red-400">
                              Error: {result.error}
                            </div>
                          ) : result.type === 'dict' && result.data ? (
                            <div className="mt-3 space-y-3">
                              {/* Insights Summary */}
                              {result.data.summary && (
                                <div className={`p-4 rounded-lg border-2 ${
                                  // Handle ADF test results
                                  result.data.is_stationary !== undefined
                                    ? result.data.is_stationary
                                      ? 'bg-green-500/10 border-green-500/30'
                                      : 'bg-yellow-500/10 border-yellow-500/30'
                                    // Handle ARIMA forecast results
                                    : result.data.trend === 'upward'
                                      ? 'bg-blue-500/10 border-blue-500/30'
                                      : result.data.trend === 'downward'
                                        ? 'bg-purple-500/10 border-purple-500/30'
                                        : 'bg-zinc-500/10 border-zinc-500/30'
                                }`}>
                                  <div className="flex items-start gap-3">
                                    <div className={`text-2xl ${
                                      // Handle ADF test results
                                      result.data.is_stationary !== undefined
                                        ? result.data.is_stationary ? 'text-green-400' : 'text-yellow-400'
                                        // Handle ARIMA forecast results
                                        : result.data.trend === 'upward'
                                          ? 'text-blue-400'
                                          : result.data.trend === 'downward'
                                            ? 'text-purple-400'
                                            : 'text-zinc-400'
                                    }`}>
                                      {/* Display appropriate icon */}
                                      {result.data.is_stationary !== undefined
                                        ? (result.data.is_stationary ? '✓' : '⚠')
                                        : result.data.summary.substring(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                      <div className={`font-semibold text-lg mb-1 ${
                                        result.data.is_stationary !== undefined
                                          ? result.data.is_stationary ? 'text-green-400' : 'text-yellow-400'
                                          : result.data.trend === 'upward'
                                            ? 'text-blue-400'
                                            : result.data.trend === 'downward'
                                              ? 'text-purple-400'
                                              : 'text-zinc-400'
                                      }`}>
                                        {result.data.summary}
                                      </div>
                                      {result.data.explanation && (
                                        <p className="text-sm text-zinc-300 mb-2">
                                          {result.data.explanation}
                                        </p>
                                      )}
                                      {result.data.recommendation && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="text-zinc-400">Recommendation:</span>
                                          <span className="text-zinc-200">{result.data.recommendation}</span>
                                        </div>
                                      )}
                                      {/* ARIMA-specific: Model Quality */}
                                      {result.data.model_quality && (
                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                          <span className="text-zinc-400">Model Quality:</span>
                                          <span className={`font-semibold ${
                                            result.data.model_quality === 'Good' ? 'text-green-400' :
                                            result.data.model_quality === 'Moderate' ? 'text-yellow-400' :
                                            'text-red-400'
                                          }`}>
                                            {result.data.model_quality}
                                          </span>
                                          <span className="text-zinc-400">-</span>
                                          <span className="text-zinc-300">{result.data.quality_note}</span>
                                        </div>
                                      )}
                                      {/* ARIMA-specific: Forecast Range */}
                                      {result.data.forecast_range && (
                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                          <span className="text-zinc-400">Forecast Range:</span>
                                          <span className="text-zinc-200 font-mono">{result.data.forecast_range}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Suggested Action */}
                              {result.data.suggested_action && (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-blue-400 mb-1">
                                        Next Step:
                                      </div>
                                      <p className="text-sm text-zinc-300">
                                        {result.data.suggested_action}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Technical Details (Collapsible) */}
                              <details className="group">
                                <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300 flex items-center gap-2">
                                  <span>View Technical Details</span>
                                  <span className="text-xs">▼</span>
                                </summary>
                                <div className="mt-2 p-3 bg-zinc-900 rounded space-y-2">
                                  {Object.entries(result.data).map(([k, v]) => {
                                    // Skip the insight fields, show only technical data
                                    if (['summary', 'explanation', 'recommendation', 'confidence', 'suggested_action',
                                         'model_quality', 'quality_note', 'forecast_range', 'trend'].includes(k)) {
                                      return null
                                    }
                                    return (
                                      <div key={k} className="flex justify-between text-sm">
                                        <span className="text-zinc-400">{k.replace(/_/g, ' ')}:</span>
                                        <span className="text-zinc-200 font-mono">
                                          {typeof v === 'number' ? v.toFixed(6) :
                                           typeof v === 'object' ? JSON.stringify(v) :
                                           String(v)}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </details>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <div className="text-sm text-zinc-500 mb-1">Current Value:</div>
                              <div className="p-3 bg-zinc-900 rounded font-mono text-sm text-zinc-200">
                                {typeof result.value === 'number' ? result.value.toFixed(4) : String(result.value)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <p className="text-sm text-zinc-500 text-center">
                  Analysis complete! {Object.keys(results).length} variable(s) evaluated.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <p className="mb-2">No results yet</p>
              <p className="text-sm">Click "Run Analysis" to evaluate your formulas</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

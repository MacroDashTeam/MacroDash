import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { TrendingUp, TrendingDown, ArrowLeft, ExternalLink, Download, Bell } from 'lucide-react'
import { Chatbot } from './chatbot'
import { PriceAlertDialog } from './price-alert-dialog'
import { TechnicalIndicators } from './technical-indicators'

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'
type FinancialPeriod = 'annual' | 'quarterly'

async function fetchStockDetail(symbol: string) {
  const res = await fetch(`/api/stocks/${symbol}/`)
  if (!res.ok) throw new Error('Failed to fetch stock data')
  return res.json()
}

async function fetchStockNews(symbol: string) {
  const res = await fetch(`/api/alpha-vantage/news/?tickers=${symbol}&limit=20`)
  if (!res.ok) throw new Error('Failed to fetch news')
  return res.json()
}

async function fetchCompanyOverview(symbol: string) {
  const res = await fetch(`/api/company/${symbol}/overview/`)
  if (!res.ok) throw new Error('Failed to fetch company overview')
  return res.json()
}

async function fetchAnalystRecommendations(symbol: string) {
  const res = await fetch(`/api/company/${symbol}/analyst-recommendations/`)
  if (!res.ok) throw new Error('Failed to fetch analyst recommendations')
  return res.json()
}

async function fetchCompanyFinancials(symbol: string, type: string) {
  const res = await fetch(`/api/company/${symbol}/financials/?type=${type}`)
  if (!res.ok) throw new Error('Failed to fetch company financials')
  return res.json()
}

async function fetchStockInsights(symbol: string) {
  const res = await fetch(`/api/company/${symbol}/insights/`)
  if (!res.ok) throw new Error('Failed to fetch stock insights')
  return res.json()
}

async function fetchAIInsights(symbol: string) {
  const res = await fetch(`/api/ai-insights/${symbol}/?limit=10`)
  if (!res.ok) throw new Error('Failed to fetch AI insights')
  return res.json()
}

export default function StockDetail({ onBack }: { onBack?: () => void }) {
  const [symbol, setSymbol] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1M')
  const [financialType, setFinancialType] = useState<'income' | 'balance' | 'cashflow'>('income')
  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>('annual')
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)

  useEffect(() => {
    // Listen for stock navigation events
    const handleStockNav = (e: CustomEvent) => {
      if (e.detail.symbol) {
        setSymbol(e.detail.symbol.toUpperCase())
      }
    }

    window.addEventListener('navigate-stock' as any, handleStockNav)
    return () => window.removeEventListener('navigate-stock' as any, handleStockNav)
  }, [])

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ['stock-detail', symbol],
    queryFn: () => fetchStockDetail(symbol!),
    enabled: !!symbol,
  })

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['stock-news', symbol],
    queryFn: () => fetchStockNews(symbol!),
    enabled: !!symbol,
  })

  const { data: overviewData } = useQuery({
    queryKey: ['company-overview', symbol],
    queryFn: () => fetchCompanyOverview(symbol!),
    enabled: !!symbol,
  })

  const { data: analystData } = useQuery({
    queryKey: ['analyst-recommendations', symbol],
    queryFn: () => fetchAnalystRecommendations(symbol!),
    enabled: !!symbol,
  })

  const { data: financialsData } = useQuery({
    queryKey: ['company-financials', symbol, financialType],
    queryFn: () => fetchCompanyFinancials(symbol!, financialType),
    enabled: !!symbol,
  })

  const { data: insightsData } = useQuery({
    queryKey: ['stock-insights', symbol],
    queryFn: () => fetchStockInsights(symbol!),
    enabled: !!symbol,
  })

  const { data: aiInsightsData } = useQuery({
    queryKey: ['ai-insights', symbol],
    queryFn: () => fetchAIInsights(symbol!),
    enabled: !!symbol,
  })

  // Store data in session storage for chatbot context
  useEffect(() => {
    if (symbol && stockData?.data) {
      sessionStorage.setItem(`stock_${symbol}`, JSON.stringify(stockData.data))
    }
  }, [symbol, stockData])

  useEffect(() => {
    if (symbol && newsData?.data) {
      sessionStorage.setItem(`news_${symbol}`, JSON.stringify(newsData.data.feed || []))
    }
  }, [symbol, newsData])

  useEffect(() => {
    if (symbol && financialsData?.data) {
      sessionStorage.setItem(`financials_${symbol}`, JSON.stringify(financialsData.data))
    }
  }, [symbol, financialsData])

  useEffect(() => {
    if (symbol && insightsData?.data) {
      sessionStorage.setItem(`insights_${symbol}`, JSON.stringify(insightsData.data))
    }
  }, [symbol, insightsData])

  useEffect(() => {
    if (symbol && analystData?.data) {
      sessionStorage.setItem(`analyst_${symbol}`, JSON.stringify(analystData.data))
    }
  }, [symbol, analystData])

  if (!symbol) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">No Stock Specified</h1>
          <p className="text-zinc-400 mt-2">Please provide a stock symbol</p>
        </div>
      </div>
    )
  }

  if (stockLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading {symbol} data...</p>
        </div>
      </div>
    )
  }

  const stock = stockData?.data
  if (!stock) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">No Data Available</h1>
          <p className="text-zinc-400 mt-2">Could not load data for {symbol}</p>
        </div>
      </div>
    )
  }

  const isPositive = stock.change >= 0
  const overview = overviewData?.data
  const news = newsData?.data?.feed || []

  // Filter historical data based on time period
  const getFilteredData = () => {
    const allData = stock.historical_data || []
    const now = new Date()
    const periods: Record<TimePeriod, number> = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
      '5Y': 1825,
    }

    const daysAgo = periods[timePeriod]
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    return allData.filter((d: { date: string }) => new Date(d.date) >= cutoffDate)
  }

  const chartData = getFilteredData()

  // Calculate returns
  const calculateReturn = (days: number) => {
    const allData = stock.historical_data || []
    if (allData.length < days) return null
    const oldPrice = allData[allData.length - days]?.close
    const currentPrice = stock.current_price
    if (!oldPrice) return null
    return ((currentPrice - oldPrice) / oldPrice) * 100
  }

  // Export financials to CSV
  const exportToCSV = () => {
    if (!financialsData?.data) return

    const reports = financialPeriod === 'annual'
      ? financialsData.data.annual_reports
      : financialsData.data.quarterly_reports

    if (!reports || reports.length === 0) return

    // Get all unique keys from all reports
    const allKeys = new Set<string>()
    reports.forEach((report: Record<string, any>) => {
      Object.keys(report).forEach(key => allKeys.add(key))
    })

    // Create CSV header
    const headers = Array.from(allKeys)
    const csvRows = [headers.join(',')]

    // Add data rows
    reports.forEach((report: Record<string, any>) => {
      const row = headers.map(header => {
        const value = report[header]
        // Escape values that contain commas or quotes
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      csvRows.push(row.join(','))
    })

    // Create CSV string
    const csvString = csvRows.join('\n')

    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${symbol}_${financialType}_${financialPeriod}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-900/20 to-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{symbol}</h1>
              <p className="text-zinc-400 mt-1">{stock.name}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 justify-end mb-2">
                <div className="text-3xl font-bold">${stock.current_price.toFixed(2)}</div>
                <button
                  onClick={() => setAlertDialogOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Bell className="w-4 h-4" />
                  Set Alert
                </button>
              </div>
              <div className={`flex items-center gap-2 justify-end ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="text-lg font-semibold">
                  {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.change_percent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Price Chart */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Price Chart</h2>
            <div className="flex gap-2">
              {(['1D', '1W', '1M', '3M', '1Y', '5Y'] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timePeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                tick={{ fill: '#71717a' }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#71717a' }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
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
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Stats */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-semibold mb-6">Key Statistics</h2>

          {/* Price Ranges */}
          <div className="space-y-6 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Day's Range</span>
                <div className="flex gap-4">
                  <span className="text-zinc-300">Low: ${chartData[0]?.low.toFixed(2) || 'N/A'}</span>
                  <span className="text-zinc-300">High: ${chartData[chartData.length - 1]?.high.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
              <div className="h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 rounded-full"></div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">52-Week Range</span>
                <div className="flex gap-4">
                  <span className="text-zinc-300">Low: ${stock['52_week_low'].toFixed(2)}</span>
                  <span className="text-zinc-300">High: ${stock['52_week_high'].toFixed(2)}</span>
                </div>
              </div>
              <div className="h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Returns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-zinc-400">1 Month Return</span>
              <span className={`font-semibold ${(calculateReturn(30) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {calculateReturn(30)?.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-zinc-400">3 Month Return</span>
              <span className={`font-semibold ${(calculateReturn(90) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {calculateReturn(90)?.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <span className="text-zinc-400">1 Year Return</span>
              <span className={`font-semibold ${(calculateReturn(252) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {calculateReturn(252)?.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Additional Stats - Using Yahoo Finance Data */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div>
              <div className="text-sm text-zinc-400">Market Cap</div>
              <div className="text-lg font-semibold mt-1">
                {stock.market_cap ? (
                  stock.market_cap >= 1e12 ? `$${(stock.market_cap / 1e12).toFixed(2)}T` :
                  stock.market_cap >= 1e9 ? `$${(stock.market_cap / 1e9).toFixed(2)}B` :
                  `$${(stock.market_cap / 1e6).toFixed(2)}M`
                ) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">P/E Ratio</div>
              <div className="text-lg font-semibold mt-1">{stock.pe_ratio?.toFixed(2) || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">EPS (TTM)</div>
              <div className="text-lg font-semibold mt-1">
                {stock.eps ? `$${stock.eps.toFixed(2)}` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Volume</div>
              <div className="text-lg font-semibold mt-1">
                {stock.volume ? (stock.volume / 1e6).toFixed(2) + 'M' : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Dividend Yield</div>
              <div className="text-lg font-semibold mt-1">
                {stock.dividend_yield ? `${(stock.dividend_yield * 100).toFixed(2)}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        {overview && overview.description && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-semibold mb-4">About {stock.name}</h2>
            <p className="text-zinc-300 leading-relaxed">{overview.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <div className="text-sm text-zinc-400">Sector</div>
                <div className="text-lg font-semibold mt-1">{overview.sector || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Industry</div>
                <div className="text-lg font-semibold mt-1">{overview.industry || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Analyst Recommendations */}
        {analystData?.data && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-semibold mb-6">Analyst Recommendations</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendation Breakdown */}
              <div>
                <div className="text-sm text-zinc-400 mb-4">
                  Based on {analystData.data.num_analysts || analystData.data.total} analysts
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'strongBuy', label: 'Strong Buy', color: 'bg-green-600' },
                    { key: 'buy', label: 'Buy', color: 'bg-green-500' },
                    { key: 'hold', label: 'Hold', color: 'bg-yellow-500' },
                    { key: 'sell', label: 'Sell', color: 'bg-red-500' },
                    { key: 'strongSell', label: 'Strong Sell', color: 'bg-red-600' }
                  ].map(({ key, label, color }) => {
                    const percentage = analystData.data.percentages[key] || 0
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">{label}</span>
                          <span className="text-zinc-300 font-semibold">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Price Targets */}
              <div>
                <h3 className="font-semibold mb-4">Price Targets</h3>
                <div className="space-y-4">
                  {analystData.data.target_price?.mean && (
                    <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                      <span className="text-zinc-400">Average Target</span>
                      <span className="text-lg font-bold text-green-500">
                        ${parseFloat(analystData.data.target_price.mean).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {analystData.data.target_price?.high && (
                    <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                      <span className="text-zinc-400">High Target</span>
                      <span className="text-lg font-semibold">
                        ${parseFloat(analystData.data.target_price.high).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {analystData.data.target_price?.low && (
                    <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                      <span className="text-zinc-400">Low Target</span>
                      <span className="text-lg font-semibold">
                        ${parseFloat(analystData.data.target_price.low).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Financials */}
        {financialsData?.data && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Company Financials</h2>
              <div className="flex gap-2 items-center">
                {/* Statement Type Toggle */}
                {['income', 'balance', 'cashflow'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFinancialType(type as typeof financialType)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors capitalize ${
                      financialType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {type === 'cashflow' ? 'Cash Flow' : type}
                  </button>
                ))}
                <div className="w-px h-6 bg-zinc-700 mx-2"></div>
                {/* Period Toggle */}
                {['annual', 'quarterly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setFinancialPeriod(period as FinancialPeriod)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors capitalize ${
                      financialPeriod === period
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {period}
                  </button>
                ))}
                <div className="w-px h-6 bg-zinc-700 mx-2"></div>
                {/* Export CSV Button */}
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {(() => {
              const reports = financialPeriod === 'annual'
                ? financialsData.data.annual_reports
                : financialsData.data.quarterly_reports

              if (!reports || reports.length === 0) {
                return (
                  <div className="text-center py-8 text-zinc-400">
                    No {financialPeriod} data available for {financialType} statement
                  </div>
                )
              }

              return (
                <div>
                  <h3 className="font-semibold mb-4 capitalize">{financialPeriod} Reports</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reports.slice(0, financialPeriod === 'annual' ? 5 : 8).reverse().map((item: any) => ({
                      ...item,
                      // Convert CapEx to absolute value for display
                      CapitalExpenditure: Math.abs(item.CapitalExpenditure || 0)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="fiscalDateEnding"
                        stroke="#71717a"
                        tick={{ fill: '#71717a' }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return financialPeriod === 'annual'
                            ? date.getFullYear().toString()
                            : `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`
                        }}
                      />
                      <YAxis
                        stroke="#71717a"
                        tick={{ fill: '#71717a' }}
                        tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          border: '1px solid #27272a',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value: number) => [`$${(value / 1e9).toFixed(2)}B`, '']}
                      />
                      <Legend />
                      {financialType === 'income' && (
                        <>
                          <Bar dataKey="TotalRevenue" fill="#3b82f6" name="Revenue" />
                          <Bar dataKey="NetIncome" fill="#10b981" name="Net Income" />
                        </>
                      )}
                      {financialType === 'balance' && (
                        <>
                          <Bar dataKey="TotalAssets" fill="#3b82f6" name="Total Assets" />
                          <Bar dataKey="TotalLiabilitiesNetMinorityInterest" fill="#ef4444" name="Total Liabilities" />
                        </>
                      )}
                      {financialType === 'cashflow' && (
                        <>
                          <Bar dataKey="OperatingCashFlow" fill="#3b82f6" name="Operating CF" />
                          <Bar dataKey="CapitalExpenditure" fill="#ef4444" name="CapEx (absolute)" />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            })()}
          </div>
        )}

        {/* Technical Indicators */}
        <TechnicalIndicators symbol={symbol} period="1y" />

        {/* Key Events - AI-Generated Blog Posts, Events, and News */}
        {aiInsightsData?.insights && aiInsightsData.insights.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-semibold mb-6">Key Events & Insights</h2>
            <p className="text-sm text-zinc-400 mb-6">
              AI-generated analysis of recent blogs, events, and news affecting {symbol}
            </p>

            <div className="space-y-4">
              {aiInsightsData.insights.map((insight: any) => {
                // Determine sentiment badge color
                const sentimentColor =
                  insight.sentiment === 'positive' ? 'bg-green-900/30 border-green-700 text-green-400' :
                  insight.sentiment === 'negative' ? 'bg-red-900/30 border-red-700 text-red-400' :
                  'bg-zinc-800/50 border-zinc-700 text-zinc-400'

                // Determine content type badge color
                const typeColor =
                  insight.content_type === 'blog' ? 'bg-purple-900/30 text-purple-400' :
                  insight.content_type === 'event' ? 'bg-blue-900/30 text-blue-400' :
                  insight.content_type === 'news' ? 'bg-emerald-900/30 text-emerald-400' :
                  insight.content_type === 'research' ? 'bg-orange-900/30 text-orange-400' :
                  'bg-cyan-900/30 text-cyan-400'

                return (
                  <div
                    key={insight.id}
                    className="p-5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 transition-colors"
                  >
                    {/* Header with title and badges */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-semibold text-white flex-1">{insight.title}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${typeColor}`}>
                          {insight.content_type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${sentimentColor}`}>
                          {insight.sentiment}
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-zinc-300 mb-4">{insight.summary}</p>

                    {/* Key Points */}
                    {insight.key_points && insight.key_points.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-zinc-400 mb-2">KEY POINTS</h4>
                        <ul className="space-y-1.5">
                          {insight.key_points.map((point: string, idx: number) => (
                            <li key={idx} className="text-sm text-zinc-300 flex gap-2">
                              <span className="text-blue-400 flex-shrink-0">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Analysis */}
                    {insight.ai_analysis && (
                      <div className="mb-4 p-3 rounded bg-blue-900/10 border border-blue-900/30">
                        <h4 className="text-xs font-semibold text-blue-400 mb-1">AI ANALYSIS</h4>
                        <p className="text-sm text-zinc-300">{insight.ai_analysis}</p>
                      </div>
                    )}

                    {/* Footer with metadata */}
                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800">
                      <div className="flex items-center gap-3">
                        <span>{insight.source}</span>
                        {insight.published_date && (
                          <>
                            <span>•</span>
                            <span>{new Date(insight.published_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </>
                        )}
                      </div>
                      {insight.sentiment_score !== undefined && (
                        <div className="flex items-center gap-2">
                          <span>Sentiment Score:</span>
                          <span className={`font-semibold ${
                            insight.sentiment_score > 0 ? 'text-green-400' :
                            insight.sentiment_score < 0 ? 'text-red-400' :
                            'text-zinc-400'
                          }`}>
                            {insight.sentiment_score > 0 ? '+' : ''}{insight.sentiment_score.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 text-xs text-zinc-500 text-center">
              Insights generated by AI • Updated every 24 hours
            </div>
          </div>
        )}

        {/* AI-Generated Insights */}
        {insightsData?.data && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-semibold mb-6">AI-Powered Key Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Positive Insights */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>Positive Insights</span>
                </h3>
                <div className="space-y-3">
                  {insightsData.data.positive?.map((insight: string, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-green-900/20 border border-green-800/50">
                      <p className="text-sm text-green-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Negative Insights */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span>Negative Insights</span>
                </h3>
                <div className="space-y-3">
                  {insightsData.data.negative?.map((insight: string, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-red-900/20 border border-red-800/50">
                      <p className="text-sm text-red-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-zinc-500 text-center">
              Insights generated by AI based on recent news sentiment
            </div>
          </div>
        )}

        {/* News Feed */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-semibold mb-6">Latest News for {symbol}</h2>

          {newsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-4">
              {news.map((article: any, index: number) => {
                const sentimentColor =
                  article.overall_sentiment_label?.includes('Bullish') ? 'text-green-500' :
                  article.overall_sentiment_label?.includes('Bearish') ? 'text-red-500' :
                  'text-zinc-400'

                return (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{new Date(article.time_published).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={sentimentColor}>{article.overall_sentiment_label}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    </div>
                  </a>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-zinc-400 py-8">No news available</p>
          )}
        </div>
      </div>

      {/* AI Chatbot */}
      <Chatbot symbol={symbol} />

      {/* Price Alert Dialog */}
      <PriceAlertDialog
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        symbol={symbol}
        stockName={stock.name}
        currentPrice={stock.current_price}
      />
    </div>
  )
}

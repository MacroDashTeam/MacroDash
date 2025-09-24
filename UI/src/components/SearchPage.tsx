import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, BarChart3, DollarSign, Calendar, Clock, Star, Bookmark } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Button } from './ui/button'
import { IndividualStockView } from './IndividualStockView'

// Mock stock data
const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.85, change: 2.34, changePercent: 1.33, volume: '45.2M' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.26, change: -3.21, changePercent: -0.77, volume: '28.9M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.21, change: 1.87, changePercent: 1.37, volume: '31.2M' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 143.31, change: 0.94, changePercent: 0.66, volume: '42.1M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -8.12, changePercent: -3.16, volume: '67.8M' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 121.39, change: 4.23, changePercent: 3.61, volume: '52.3M' },
]

// Mock chart data
const generateChartData = (symbol: string) => {
  const basePrice = mockStocks.find(s => s.symbol === symbol)?.price || 100
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: basePrice + (Math.random() - 0.5) * 20 + Math.sin(i / 5) * 10,
  }))
}

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [filteredStocks, setFilteredStocks] = useState(mockStocks)
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'MSFT'])
  const [showIndividualView, setShowIndividualView] = useState<string | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredStocks(mockStocks)
    } else {
      setFilteredStocks(
        mockStocks.filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    }
  }

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  // Check if individual view should be shown
  if (showIndividualView) {
    return (
      <IndividualStockView 
        stockSymbol={showIndividualView} 
        onBack={() => setShowIndividualView(null)} 
      />
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-y-auto">
    <div className="p-6">
        
        {/* Header & Search Bar */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-medium text-white mb-2">Stock Search</h1>
            <p className="text-slate-400">Search and analyze individual stocks with real-time data</p>
          </div>
          
          {/* Search Input */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search stocks by symbol or company name (e.g., AAPL, Apple)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-md"
            />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Panel - Search Results */}
          <div className="lg:col-span-1 bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl">
            <div className="p-6 border-b border-slate-600/30">
              <h3 className="text-white text-lg font-medium mb-1">Search Results</h3>
              <p className="text-slate-400 text-sm">{filteredStocks.length} stocks found</p>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-[600px]">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    setSelectedStock(stock.symbol)
                    setShowIndividualView(stock.symbol)
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedStock === stock.symbol
                      ? 'bg-blue-600/20 border-blue-500/50'
                      : 'bg-slate-700/30 border-slate-600/20 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium text-lg">{stock.symbol}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWatchlist(stock.symbol)
                          }}
                          className="p-1 hover:bg-slate-600/50 rounded"
                        >
                          {watchlist.includes(stock.symbol) ? (
                            <Star className="text-yellow-400 fill-current" size={16} />
                          ) : (
                            <Star className="text-slate-400" size={16} />
                          )}
                        </button>
                      </div>
                      <p className="text-slate-400 text-sm truncate">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${stock.price.toFixed(2)}</p>
                      <div className={`flex items-center gap-1 text-sm ${
                        stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Vol: {stock.volume}</span>
                    <span>{stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Stock Details & Chart */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedStock ? (
              <>
                {/* Stock Header */}
                <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl p-6">
                  {(() => {
                    const stock = mockStocks.find(s => s.symbol === selectedStock)!
                    return (
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-medium text-white">{stock.symbol}</h2>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleWatchlist(stock.symbol)}
                              className="border-slate-600/50 text-slate-300"
                            >
                              <Bookmark className="mr-2" size={16} />
                              {watchlist.includes(stock.symbol) ? 'Remove' : 'Watch'}
                            </Button>
                          </div>
                          <p className="text-slate-400 mb-3">{stock.name}</p>
                          <div className="flex items-center gap-6">
                            <div className="text-3xl font-medium text-white">
                              ${stock.price.toFixed(2)}
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                              stock.change >= 0 
                                ? 'bg-green-400/20 text-green-400' 
                                : 'bg-red-400/20 text-red-400'
                            }`}>
                              {stock.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                              <span className="font-medium">
                                {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <BarChart3 size={16} />
                            <span className="text-sm">Volume: {stock.volume}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={16} />
                            <span className="text-sm">Updated: Now</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Chart */}
                <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-lg font-medium">Price Chart (30 Days)</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                        1D
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                        7D
                      </Button>
                      <Button size="sm" variant="default" className="bg-blue-600">
                        30D
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                        1Y
                      </Button>
                    </div>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateChartData(selectedStock)}>
                        <XAxis 
                          dataKey="day" 
                          stroke="#94A3B8" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#94A3B8" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          labelStyle={{ color: '#94A3B8' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={false}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              /* Placeholder when no stock selected */
              <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl p-12 text-center">
                <BarChart3 className="mx-auto mb-4 text-slate-400" size={64} />
                <h3 className="text-xl text-white mb-2">Select a Stock to View Details</h3>
                <p className="text-slate-400">Choose a stock from the search results to view its chart and details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

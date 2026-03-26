import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Search } from 'lucide-react'
import { Input } from './ui/input'
import { useNavigate } from 'react-router'

interface Stock {
  symbol: string
  name: string
  sector: string
  industry: string
  market_cap: number
  current_price: number
  change: number
  change_percent: number
  volume: number
  pe_ratio: number | null
  eps: number | null
  dividend_yield: number | null
  beta: number | null
}

interface BrowseData {
  status: string
  data: {
    category: string
    stocks: Stock[]
    total: number
  }
  timestamp: string
}

async function fetchBrowseStocks(category?: string, sector?: string) {
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (sector) params.append('sector', sector)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`/api/stocks/browse/${queryString}`)
  if (!res.ok) throw new Error('Failed to fetch stocks')
  return await res.json()
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toFixed(2)}`
}

export default function BrowseStocks() {
  const [activeTab, setActiveTab] = useState<'category' | 'sector' | 'etf'>('category')
  const [selectedCategory, setSelectedCategory] = useState<string>('mega_cap')
  const [selectedSector, setSelectedSector] = useState<string>('technology')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: browseData, isLoading } = useQuery<BrowseData>({
    queryKey: ['browse-stocks', activeTab === 'category' ? selectedCategory : activeTab === 'sector' ? selectedSector : 'etf', activeTab],
    queryFn: () => fetchBrowseStocks(
      activeTab === 'category' ? selectedCategory : activeTab === 'etf' ? 'etf' : undefined,
      activeTab === 'sector' ? selectedSector : undefined
    ),
  })

  const categories = [
    { id: 'mega_cap', label: 'Mega Cap', description: '$200B+' },
    { id: 'large_cap', label: 'Large Cap', description: '$10B-$200B' },
    { id: 'mid_cap', label: 'Mid Cap', description: '$2B-$10B' },
    { id: 'small_cap', label: 'Small Cap', description: '$300M-$2B' },
  ]

  const sectors = [
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'consumer', label: 'Consumer', icon: '🛒' },
    { id: 'energy', label: 'Energy', icon: '⚡' },
    { id: 'industrial', label: 'Industrial', icon: '🏭' },
  ]

  const navigate = useNavigate();

  const handleStockClick = (symbol: string) => {
    navigate(`/stock/${symbol}`)
  }

  const filteredStocks = browseData?.data?.stocks?.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Browse Stocks</h1>
        <p className="text-zinc-400 mt-2">
          Explore stocks by market capitalization or sector
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('category')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'category'
            ? 'border-blue-500 text-white'
            : 'border-transparent text-zinc-400 hover:text-white'
            }`}
        >
          Market Cap
        </button>
        <button
          onClick={() => setActiveTab('sector')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'sector'
            ? 'border-blue-500 text-white'
            : 'border-transparent text-zinc-400 hover:text-white'
            }`}
        >
          Sector
        </button>
        <button
          onClick={() => setActiveTab('etf')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'etf'
            ? 'border-blue-500 text-white'
            : 'border-transparent text-zinc-400 hover:text-white'
            }`}
        >
          ETFs
        </button>
      </div>

      {/* Category/Sector Selection */}
      <div>
        {activeTab === 'etf' ? (
          <p className="text-zinc-400 text-sm">Showing global ETFs tracked on Yahoo Finance. Click any to view full technical analysis.</p>
        ) : activeTab === 'category' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-lg border transition-all ${selectedCategory === cat.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
              >
                <div className="text-lg font-semibold">{cat.label}</div>
                <div className="text-sm text-zinc-400 mt-1">{cat.description}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setSelectedSector(sector.id)}
                className={`p-4 rounded-lg border transition-all ${selectedSector === sector.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
              >
                <div className="text-3xl mb-2">{sector.icon}</div>
                <div className="text-sm font-semibold">{sector.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Search stocks by symbol or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900/50 border-zinc-800"
        />
      </div>

      {/* Results Header */}
      {browseData?.data && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{browseData.data.category}</h2>
          <p className="text-zinc-400">
            {filteredStocks.length} {filteredStocks.length === 1 ? 'stock' : 'stocks'}
          </p>
        </div>
      )}

      {/* Stock Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg border border-zinc-800 bg-zinc-900/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleStockClick(stock.symbol)}
              className="text-left p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xl font-bold">{stock.symbol}</div>
                  <div className="text-sm text-zinc-400 line-clamp-1">{stock.name}</div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${stock.change >= 0
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                    }`}
                >
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stock.change_percent.toFixed(2)}%</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="text-2xl font-bold">${stock.current_price.toFixed(2)}</div>
                <div className={`text-sm ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Market Cap</span>
                  <span className="font-medium">{formatMarketCap(stock.market_cap)}</span>
                </div>
                {stock.pe_ratio && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">P/E Ratio</span>
                    <span className="font-medium">{stock.pe_ratio.toFixed(2)}</span>
                  </div>
                )}
                {stock.eps && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">EPS (TTM)</span>
                    <span className="font-medium">{stock.eps.toFixed(2)}</span>
                  </div>
                )}
                {stock.dividend_yield && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Dividend Yield</span>
                    <span className="font-medium">{(stock.dividend_yield * 100).toFixed(2)}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Sector</span>
                  <span className="font-medium text-zinc-300 truncate ml-2">{stock.sector}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No stocks found matching your search.</p>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Search } from 'lucide-react'
import { Input } from './ui/input'
import { Card } from './ui/card'

interface Crypto {
  id: number
  symbol: string
  name: string
  slug: string
  cmc_rank: number
  current_price: number
  market_cap: number
  volume_24h: number
  circulating_supply: number
  total_supply: number | null
  max_supply: number | null
  change_1h: number
  change_24h: number
  change_7d: number
  change_30d: number
  last_updated: string
}

interface CryptoData {
  status: string
  data: {
    cryptos: Crypto[]
    total: number
  }
  timestamp: string
}

async function fetchCryptoListings(limit: number = 100) {
  const res = await fetch(`/api/crypto/?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch crypto listings')
  return await res.json()
}

async function fetchTopGainers(limit: number = 10) {
  const res = await fetch(`/api/crypto/top/gainers/?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch top gainers')
  return await res.json()
}

async function fetchTopLosers(limit: number = 10) {
  const res = await fetch(`/api/crypto/top/losers/?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch top losers')
  return await res.json()
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toFixed(2)}`
}

function formatVolume(volume: number): string {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
  return `$${volume.toFixed(2)}`
}

function formatSupply(supply: number): string {
  if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`
  if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`
  if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`
  return supply.toFixed(2)
}

export default function CryptoDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'gainers' | 'losers'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: cryptoData, isLoading: isLoadingAll } = useQuery<CryptoData>({
    queryKey: ['crypto-listings'],
    queryFn: () => fetchCryptoListings(100),
    refetchInterval: 60000, // Refetch every minute
  })

  const { data: gainersData, isLoading: isLoadingGainers } = useQuery<CryptoData>({
    queryKey: ['crypto-gainers'],
    queryFn: () => fetchTopGainers(20),
    refetchInterval: 60000,
  })

  const { data: losersData, isLoading: isLoadingLosers } = useQuery<CryptoData>({
    queryKey: ['crypto-losers'],
    queryFn: () => fetchTopLosers(20),
    refetchInterval: 60000,
  })

  const handleCryptoClick = (symbol: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-crypto', { detail: symbol }))
  }

  const getDisplayData = () => {
    if (activeTab === 'gainers') return gainersData?.data?.cryptos || []
    if (activeTab === 'losers') return losersData?.data?.cryptos || []
    return cryptoData?.data?.cryptos || []
  }

  const filteredCryptos = getDisplayData().filter(crypto =>
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isLoading = activeTab === 'all' ? isLoadingAll :
                   activeTab === 'gainers' ? isLoadingGainers : isLoadingLosers

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cryptocurrency Market</h1>
        <p className="text-zinc-400 mt-2">
          Real-time cryptocurrency prices and market data powered by CoinMarketCap
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          All Cryptocurrencies
        </button>
        <button
          onClick={() => setActiveTab('gainers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
            activeTab === 'gainers'
              ? 'border-green-500 text-green-500'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp size={16} />
          Top Gainers
        </button>
        <button
          onClick={() => setActiveTab('losers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
            activeTab === 'losers'
              ? 'border-red-500 text-red-500'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingDown size={16} />
          Top Losers
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <Input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Crypto List */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Loading cryptocurrencies...</div>
      ) : filteredCryptos.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          No cryptocurrencies found matching "{searchQuery}"
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Name</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Price</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">1h %</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">24h %</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">7d %</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Market Cap</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Volume (24h)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Max Supply</th>
              </tr>
            </thead>
            <tbody>
              {filteredCryptos.map((crypto) => (
                <tr
                  key={crypto.id}
                  onClick={() => handleCryptoClick(crypto.symbol)}
                  className="border-b border-zinc-800 hover:bg-zinc-900/50 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-4 text-sm text-zinc-400">{crypto.cmc_rank}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${crypto.id}.png`}
                        alt={crypto.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/32'
                        }}
                      />
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-zinc-400">{crypto.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium">
                    ${crypto.current_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: crypto.current_price < 1 ? 6 : 2
                    })}
                  </td>
                  <td className={`py-4 px-4 text-right text-sm ${
                    crypto.change_1h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {crypto.change_1h >= 0 ? '+' : ''}{crypto.change_1h.toFixed(2)}%
                  </td>
                  <td className={`py-4 px-4 text-right text-sm ${
                    crypto.change_24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h.toFixed(2)}%
                  </td>
                  <td className={`py-4 px-4 text-right text-sm ${
                    crypto.change_7d >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {crypto.change_7d >= 0 ? '+' : ''}{crypto.change_7d.toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-zinc-400">
                    {formatMarketCap(crypto.market_cap)}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-zinc-400">
                    {formatVolume(crypto.volume_24h)}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-zinc-400">
                    {crypto.max_supply ? (
                      <div>
                        <div>{formatSupply(crypto.max_supply)}</div>
                        <div className="text-xs text-zinc-600">
                          {crypto.circulating_supply && ((crypto.circulating_supply / crypto.max_supply) * 100).toFixed(1)}% circ.
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-600">∞</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {!isLoading && filteredCryptos.length > 0 && (
        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="text-sm text-zinc-400">
            Showing {filteredCryptos.length} cryptocurrencies
            {activeTab === 'all' && cryptoData?.data?.total &&
              ` • Total Market: ${formatMarketCap(cryptoData.data.cryptos.reduce((sum, c) => sum + c.market_cap, 0))}`
            }
          </div>
        </Card>
      )}
    </div>
  )
}

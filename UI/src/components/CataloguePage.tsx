import { useState } from 'react'
import { Database, ExternalLink, ChevronDown, ChevronRight, BarChart3, TrendingUp, Calendar, Globe, FileText, Users, DollarSign, Activity, Clock, Star, BookOpen } from 'lucide-react'
import { Button } from './ui/button'

// Mock data sources
const dataSources = [
  {
    id: 1,
    name: 'Yahoo Finance',
    type: 'Market Data',
    description: 'Real-time and historical stock prices, financial news, and market analysis',
    status: 'active',
    coverage: 'Global',
    updateFreq: 'Real-time',
    icon: <Globe className="text-blue-400" size={20} />,
    features: ['Stock Prices', 'Options Data', 'Financial News', 'Market Screeners']
  },
  {
    id: 2,
    name: 'Alpha Vantage',
    type: 'API Service',
    description: 'Free and premium APIs for real-time and historical financial market data',
    status: 'active',
    coverage: 'Global',
    updateFreq: 'Real-time',
    icon: <Database className="text-green-400" size={20} />,
    features: ['Technical Indicators', 'Fundamental Data', 'Forex Data', 'Crypto Data']
  },
  {
    id: 3,
    name: 'FRED Economic Data',
    type: 'Economic Data',
    description: 'Federal Reserve Economic Data from the St. Louis Fed',
    status: 'active',
    coverage: 'US & International',
    updateFreq: 'Daily',
    icon: <BarChart3 className="text-purple-400" size={20} />,
    features: ['GDP Data', 'Inflation Rates', 'Employment Stats', 'Interest Rates']
  },
  {
    id: 4,
    name: 'Quandl',
    type: 'Financial Data',
    description: 'Alternative and core financial, economic and alternative datasets',
    status: 'active',
    coverage: 'Global',
    updateFreq: 'Varies',
    icon: <FileText className="text-orange-400" size={20} />,
    features: ['Alternative Data', 'Economic Indicators', 'Commodity Prices', 'Currency Data']
  },
  {
    id: 5,
    name: 'IEX Cloud',
    type: 'Market Data',
    description: 'Reliable, enterprise-grade financial data infrastructure',
    status: 'active',
    coverage: 'US Markets',
    updateFreq: 'Real-time',
    icon: <Activity className="text-cyan-400" size={20} />,
    features: ['Stock Data', 'Market Stats', 'Reference Data', 'Time Series']
  },
  {
    id: 6,
    name: 'Morningstar',
    type: 'Research',
    description: 'Independent investment research and portfolio tools',
    status: 'premium',
    coverage: 'Global',
    updateFreq: 'Daily',
    icon: <Star className="text-yellow-400" size={20} />,
    features: ['Fund Analysis', 'Stock Research', 'Portfolio Analytics', 'ESG Data']
  },
  {
    id: 7,
    name: 'Bloomberg Terminal',
    type: 'Professional',
    description: 'Professional financial software system and data terminal',
    status: 'premium',
    coverage: 'Global',
    updateFreq: 'Real-time',
    icon: <Users className="text-indigo-400" size={20} />,
    features: ['Professional Analytics', 'News', 'Trading Tools', 'Risk Management']
  },
  {
    id: 8,
    name: 'SEC EDGAR',
    type: 'Regulatory',
    description: 'Electronic data gathering and retrieval system for corporate filings',
    status: 'free',
    coverage: 'US Public Companies',
    updateFreq: 'As Filed',
    icon: <BookOpen className="text-red-400" size={20} />,
    features: ['10-K Reports', '10-Q Reports', '8-K Reports', 'Proxy Statements']
  }
]

// Mock time series data
const timeSeriesData = [
  {
    id: 1,
    category: 'US Equity Markets',
    expanded: false,
    series: [
      {
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        summary: 'Tracks the S&P 500 index, representing large-cap US stocks',
        dataPoints: 5420,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        summary: 'Tracks the Nasdaq-100 index, tech-heavy large-cap stocks',
        dataPoints: 4890,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'IWM',
        name: 'iShares Russell 2000 ETF',
        summary: 'Tracks small-cap US equity market performance',
        dataPoints: 3650,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      }
    ]
  },
  {
    id: 2,
    category: 'International Markets',
    expanded: false,
    series: [
      {
        symbol: 'EFA',
        name: 'iShares MSCI EAFE ETF',
        summary: 'Developed markets in Europe, Australasia, and Far East',
        dataPoints: 4200,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'EEM',
        name: 'iShares MSCI Emerging Markets ETF',
        summary: 'Emerging market equities across multiple countries',
        dataPoints: 3800,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'VGK',
        name: 'Vanguard FTSE Europe ETF',
        summary: 'European developed market exposure',
        dataPoints: 2950,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      }
    ]
  },
  {
    id: 3,
    category: 'Fixed Income',
    expanded: false,
    series: [
      {
        symbol: 'TLT',
        name: '20+ Year Treasury Bond ETF',
        summary: 'Long-term US Treasury bonds, sensitive to interest rate changes',
        dataPoints: 4100,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'HYG',
        name: 'iShares High Yield Corporate Bond ETF',
        summary: 'High-yield corporate bond exposure for income generation',
        dataPoints: 3400,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'AGG',
        name: 'iShares Core U.S. Aggregate Bond ETF',
        summary: 'Broad-based US investment-grade bond market exposure',
        dataPoints: 4800,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      }
    ]
  },
  {
    id: 4,
    category: 'Commodities',
    expanded: false,
    series: [
      {
        symbol: 'GLD',
        name: 'SPDR Gold Shares',
        summary: 'Gold bullion exposure for portfolio diversification and inflation hedge',
        dataPoints: 5100,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'USO',
        name: 'United States Oil Fund',
        summary: 'Crude oil price exposure through futures contracts',
        dataPoints: 3900,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'DBA',
        name: 'Invesco DB Agriculture Fund',
        summary: 'Agricultural commodity exposure including corn, wheat, soybeans',
        dataPoints: 2800,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      }
    ]
  },
  {
    id: 5,
    category: 'Economic Indicators',
    expanded: false,
    series: [
      {
        symbol: 'GDP',
        name: 'US Gross Domestic Product',
        summary: 'Quarterly measure of total economic activity in the United States',
        dataPoints: 280,
        lastUpdate: '2024-07-25',
        frequency: 'Quarterly',
        source: 'FRED'
      },
      {
        symbol: 'CPI',
        name: 'Consumer Price Index',
        summary: 'Monthly measure of inflation based on consumer goods and services',
        dataPoints: 850,
        lastUpdate: '2024-08-15',
        frequency: 'Monthly',
        source: 'FRED'
      },
      {
        symbol: 'UNRATE',
        name: 'Unemployment Rate',
        summary: 'Monthly unemployment rate as percentage of labor force',
        dataPoints: 900,
        lastUpdate: '2024-09-06',
        frequency: 'Monthly',
        source: 'FRED'
      }
    ]
  },
  {
    id: 6,
    category: 'Cryptocurrencies',
    expanded: false,
    series: [
      {
        symbol: 'BTC-USD',
        name: 'Bitcoin',
        summary: 'Leading cryptocurrency by market capitalization and adoption',
        dataPoints: 2800,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'ETH-USD',
        name: 'Ethereum',
        summary: 'Smart contract platform and second-largest cryptocurrency',
        dataPoints: 2400,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      },
      {
        symbol: 'ADA-USD',
        name: 'Cardano',
        summary: 'Proof-of-stake blockchain platform with focus on sustainability',
        dataPoints: 1800,
        lastUpdate: '2024-09-24',
        frequency: 'Daily',
        source: 'Yahoo Finance'
      }
    ]
  }
]

export function CataloguePage() {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400/20 text-green-400 border-green-400/30'
      case 'premium': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
      case 'free': return 'bg-blue-400/20 text-blue-400 border-blue-400/30'
      default: return 'bg-slate-400/20 text-slate-400 border-slate-400/30'
    }
  }

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-medium text-white mb-2">Data Catalogue</h1>
          <p className="text-slate-400">Explore available data sources and time series for financial analysis</p>
        </div>

        {/* Main Layout: 30% Left + 70% Right */}
        <div className="grid grid-cols-[30%_70%] gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Panel - Data Sources (30%) */}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl">
            <div className="p-6 border-b border-slate-600/30">
              <h3 className="text-white text-lg font-medium mb-1">Data Sources</h3>
              <p className="text-slate-400 text-sm">{dataSources.length} sources available</p>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
              {dataSources.map((source) => (
                <div
                  key={source.id}
                  className="p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/20 rounded-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 mt-1">
                      {source.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium truncate">{source.name}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(source.status)}`}>
                          {source.status}
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">{source.type}</p>
                      <p className="text-slate-300 text-sm leading-tight">{source.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Globe size={12} className="text-slate-400" />
                        <span className="text-slate-400">{source.coverage}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-slate-400">{source.updateFreq}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {source.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {source.features.length > 3 && (
                        <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded">
                          +{source.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-600/30">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-0 h-auto"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Time Series (70%) */}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl">
            <div className="p-6 border-b border-slate-600/30">
              <h3 className="text-white text-lg font-medium mb-1">Available Time Series</h3>
              <p className="text-slate-400 text-sm">Expandable categories with detailed series information</p>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
              {timeSeriesData.map((category) => (
                <div key={category.id} className="border border-slate-600/30 rounded-lg overflow-hidden">
                  
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full p-4 bg-slate-700/50 hover:bg-slate-700/70 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="text-slate-400" size={16} />
                        ) : (
                          <ChevronRight className="text-slate-400" size={16} />
                        )}
                        <h4 className="text-white font-medium">{category.category}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">{category.series.length} series</span>
                      <BarChart3 className="text-slate-400" size={16} />
                    </div>
                  </button>
                  
                  {/* Expanded Content */}
                  {expandedCategories.includes(category.id) && (
                    <div className="bg-slate-800/30">
                      {category.series.map((series, index) => (
                        <div key={index} className="p-4 border-t border-slate-600/20 hover:bg-slate-700/20 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-white font-medium">{series.symbol}</h5>
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                  {series.frequency}
                                </span>
                              </div>
                              <p className="text-slate-300 text-sm mb-2">{series.name}</p>
                              <p className="text-slate-400 text-sm leading-relaxed">{series.summary}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3 text-xs">
                            <div className="flex items-center gap-1">
                              <Database size={12} className="text-slate-400" />
                              <span className="text-slate-400">Data Points:</span>
                              <span className="text-white">{series.dataPoints.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-slate-400" />
                              <span className="text-slate-400">Updated:</span>
                              <span className="text-white">{series.lastUpdate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-400" />
                              <span className="text-slate-400">Frequency:</span>
                              <span className="text-white">{series.frequency}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ExternalLink size={12} className="text-slate-400" />
                              <span className="text-slate-400">Source:</span>
                              <span className="text-white">{series.source}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="text-xs h-8">
                              <TrendingUp size={12} className="mr-1" />
                              View Chart
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs h-8 text-blue-400 hover:text-blue-300">
                              <Database size={12} className="mr-1" />
                              Export Data
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

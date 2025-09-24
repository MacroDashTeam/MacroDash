import { useState } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart3, TrendingUp, Globe, Bell, Settings, Layout, Monitor, Rss, Calendar } from 'lucide-react'
import { Button } from './ui/button'

// Mock dashboard displays data
const initialDisplays = [
  {
    id: 1,
    title: 'Economic Indicators Chart',
    type: 'chart',
    description: 'GDP growth, inflation rate, unemployment rate trends',
    position: 'top-left',
    size: 'medium',
    visible: true,
    dataSources: ['FRED Economic Data', 'Bureau of Labor Statistics'],
    lastUpdated: '2024-09-24T09:15:00Z',
    updateFreq: 'Daily'
  },
  {
    id: 2,
    title: 'Stock Market Overview',
    type: 'chart',
    description: 'S&P 500, NASDAQ, Dow Jones performance',
    position: 'top-right',
    size: 'medium',
    visible: true,
    dataSources: ['Yahoo Finance', 'Alpha Vantage'],
    lastUpdated: '2024-09-24T09:30:00Z',
    updateFreq: 'Real-time'
  },
  {
    id: 3,
    title: 'Market Sentiment Analysis',
    type: 'chart',
    description: 'Sector-wise sentiment from social media and news',
    position: 'bottom-left',
    size: 'small',
    visible: true,
    dataSources: ['Twitter API', 'News Aggregator'],
    lastUpdated: '2024-09-24T08:45:00Z',
    updateFreq: 'Hourly'
  },
  {
    id: 4,
    title: 'Economic Calendar',
    type: 'table',
    description: 'Upcoming economic events and data releases',
    position: 'bottom-center',
    size: 'small',
    visible: true,
    dataSources: ['Trading Economics', 'Investing.com'],
    lastUpdated: '2024-09-24T06:00:00Z',
    updateFreq: 'Daily'
  },
  {
    id: 5,
    title: 'Crypto Market Dashboard',
    type: 'chart',
    description: 'Bitcoin, Ethereum, and top altcoin prices',
    position: 'sidebar',
    size: 'small',
    visible: false,
    dataSources: ['CoinGecko', 'Binance API'],
    lastUpdated: '2024-09-24T09:20:00Z',
    updateFreq: 'Real-time'
  },
  {
    id: 6,
    title: 'Bond Yield Curves',
    type: 'chart',
    description: 'Treasury yield curves and corporate bond spreads',
    position: 'floating',
    size: 'large',
    visible: false,
    dataSources: ['FRED', 'Bloomberg'],
    lastUpdated: '2024-09-24T08:00:00Z',
    updateFreq: 'Daily'
  }
]

// Mock news subscriptions data
const initialNewsSubscriptions = [
  {
    id: 1,
    name: 'Reuters Business News',
    category: 'General Business',
    description: 'Breaking business news and market updates',
    source: 'Reuters',
    keywords: ['stocks', 'economy', 'earnings', 'GDP'],
    active: true,
    priority: 'high',
    feedUrl: 'https://reuters.com/business/rss',
    lastFetched: '2024-09-24T09:25:00Z',
    articleCount: 1247
  },
  {
    id: 2,
    name: 'Federal Reserve News',
    category: 'Monetary Policy',
    description: 'Official Federal Reserve announcements and speeches',
    source: 'Federal Reserve',
    keywords: ['interest rates', 'monetary policy', 'inflation', 'FOMC'],
    active: true,
    priority: 'high',
    feedUrl: 'https://federalreserve.gov/feeds/press_all.xml',
    lastFetched: '2024-09-24T07:30:00Z',
    articleCount: 89
  },
  {
    id: 3,
    name: 'MarketWatch Stock Analysis',
    category: 'Stock Analysis',
    description: 'In-depth stock analysis and market commentary',
    source: 'MarketWatch',
    keywords: ['stock analysis', 'market trends', 'earnings', 'valuations'],
    active: true,
    priority: 'medium',
    feedUrl: 'https://marketwatch.com/rss',
    lastFetched: '2024-09-24T09:10:00Z',
    articleCount: 2156
  },
  {
    id: 4,
    name: 'Economic Policy Institute',
    category: 'Economic Research',
    description: 'Economic policy research and labor market analysis',
    source: 'EPI',
    keywords: ['labor market', 'wages', 'economic policy', 'employment'],
    active: false,
    priority: 'low',
    feedUrl: 'https://epi.org/feed/',
    lastFetched: '2024-09-23T15:20:00Z',
    articleCount: 156
  },
  {
    id: 5,
    name: 'Crypto News Feed',
    category: 'Cryptocurrency',
    description: 'Latest cryptocurrency and blockchain news',
    source: 'CoinDesk',
    keywords: ['bitcoin', 'ethereum', 'blockchain', 'defi'],
    active: true,
    priority: 'medium',
    feedUrl: 'https://coindesk.com/feed',
    lastFetched: '2024-09-24T09:35:00Z',
    articleCount: 892
  },
  {
    id: 6,
    name: 'SEC Filings Alert',
    category: 'Regulatory',
    description: 'Important SEC filings and regulatory updates',
    source: 'SEC',
    keywords: ['10-K', '10-Q', '8-K', 'insider trading'],
    active: true,
    priority: 'medium',
    feedUrl: 'https://sec.gov/rss',
    lastFetched: '2024-09-24T08:15:00Z',
    articleCount: 456
  },
  {
    id: 7,
    name: 'International Economic News',
    category: 'Global Economics',
    description: 'International economic developments and trade news',
    source: 'Financial Times',
    keywords: ['global economy', 'trade', 'emerging markets', 'currency'],
    active: false,
    priority: 'low',
    feedUrl: 'https://ft.com/rss',
    lastFetched: '2024-09-24T06:45:00Z',
    articleCount: 678
  }
]

export function ManageDisplaysPage() {
  const [displays, setDisplays] = useState(initialDisplays)
  const [newsSubscriptions, setNewsSubscriptions] = useState(initialNewsSubscriptions)

  // Display management functions
  const toggleDisplayVisibility = (id: number) => {
    setDisplays(prev =>
      prev.map(display =>
        display.id === id ? { ...display, visible: !display.visible } : display
      )
    )
  }

  const removeDisplay = (id: number) => {
    setDisplays(prev => prev.filter(display => display.id !== id))
  }

  const addNewDisplay = () => {
    const newDisplay = {
      id: Date.now(),
      title: 'New Display',
      type: 'chart',
      description: 'Click edit to configure this display',
      position: 'floating',
      size: 'medium',
      visible: false,
      dataSources: [],
      lastUpdated: new Date().toISOString(),
      updateFreq: 'Daily'
    }
    setDisplays(prev => [...prev, newDisplay])
  }

  // News subscription management functions
  const toggleSubscriptionActive = (id: number) => {
    setNewsSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, active: !sub.active } : sub
      )
    )
  }

  const removeSubscription = (id: number) => {
    setNewsSubscriptions(prev => prev.filter(sub => sub.id !== id))
  }

  const addNewSubscription = () => {
    const newSubscription = {
      id: Date.now(),
      name: 'New News Feed',
      category: 'General',
      description: 'Click edit to configure this subscription',
      source: 'Custom',
      keywords: [],
      active: false,
      priority: 'medium',
      feedUrl: '',
      lastFetched: new Date().toISOString(),
      articleCount: 0
    }
    setNewsSubscriptions(prev => [...prev, newSubscription])
  }

  const getDisplayTypeIcon = (type: string) => {
    switch (type) {
      case 'chart': return <BarChart3 size={16} className="text-blue-400" />
      case 'table': return <Layout size={16} className="text-green-400" />
      default: return <Monitor size={16} className="text-slate-400" />
    }
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-green-400/20 text-green-400 border-green-400/30'
      case 'medium': return 'bg-blue-400/20 text-blue-400 border-blue-400/30'
      case 'large': return 'bg-purple-400/20 text-purple-400 border-purple-400/30'
      default: return 'bg-slate-400/20 text-slate-400 border-slate-400/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400/20 text-red-400 border-red-400/30'
      case 'medium': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
      case 'low': return 'bg-slate-400/20 text-slate-400 border-slate-400/30'
      default: return 'bg-slate-400/20 text-slate-400 border-slate-400/30'
    }
  }

  return (
   <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-y-auto">
    <div className="p-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-medium text-white mb-2">Manage Displays</h1>
          <p className="text-slate-400">Configure dashboard displays and news subscriptions for your home view</p>
        </div>

        {/* Main Layout: 50% Left + 50% Right */}
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Panel - Dashboard Displays */}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-600/30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-lg font-medium mb-1">Dashboard Displays</h3>
                  <p className="text-slate-400 text-sm">{displays.length} displays configured</p>
                </div>
                <Button 
                  onClick={addNewDisplay}
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Display
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {displays.map((display) => (
                <div
                  key={display.id}
                  className={`p-4 border rounded-lg transition-all ${
                    display.visible 
                      ? 'bg-slate-700/50 border-slate-600/50' 
                      : 'bg-slate-800/30 border-slate-600/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getDisplayTypeIcon(display.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium truncate">{display.title}</h4>
                          {display.visible ? (
                            <Eye className="text-green-400" size={14} />
                          ) : (
                            <EyeOff className="text-slate-400" size={14} />
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{display.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getSizeColor(display.size)}`}>
                            {display.size}
                          </span>
                          <span className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded">
                            {display.position}
                          </span>
                          <span className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded">
                            {display.updateFreq}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="text-xs text-slate-400">
                      <span>Data Sources: </span>
                      <span className="text-slate-300">
                        {display.dataSources.length > 0 ? display.dataSources.join(', ') : 'None configured'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <span>Last Updated: </span>
                      <span className="text-slate-300">
                        {new Date(display.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t border-slate-600/30">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleDisplayVisibility(display.id)}
                      className={`text-xs h-8 ${
                        display.visible 
                          ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-400/10'
                      }`}
                    >
                      {display.visible ? <EyeOff size={12} className="mr-1" /> : <Eye size={12} className="mr-1" />}
                      {display.visible ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 text-xs h-8"
                    >
                      <Edit size={12} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDisplay(display.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-8"
                    >
                      <Trash2 size={12} className="mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - News Subscriptions */}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-600/30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-lg font-medium mb-1">News Subscriptions</h3>
                  <p className="text-slate-400 text-sm">{newsSubscriptions.length} subscriptions configured</p>
                </div>
                <Button 
                  onClick={addNewSubscription}
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Feed
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {newsSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className={`p-4 border rounded-lg transition-all ${
                    subscription.active 
                      ? 'bg-slate-700/50 border-slate-600/50' 
                      : 'bg-slate-800/30 border-slate-600/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Rss className="text-orange-400 flex-shrink-0 mt-1" size={16} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium truncate">{subscription.name}</h4>
                          {subscription.active ? (
                            <Bell className="text-green-400" size={14} />
                          ) : (
                            <Bell className="text-slate-400" size={14} />
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{subscription.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(subscription.priority)}`}>
                            {subscription.priority}
                          </span>
                          <span className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded">
                            {subscription.category}
                          </span>
                          <span className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded">
                            {subscription.articleCount} articles
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="text-xs text-slate-400">
                      <span>Source: </span>
                      <span className="text-slate-300">{subscription.source}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <span>Keywords: </span>
                      <span className="text-slate-300">
                        {subscription.keywords.length > 0 ? subscription.keywords.join(', ') : 'All topics'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <span>Last Fetched: </span>
                      <span className="text-slate-300">
                        {new Date(subscription.lastFetched).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t border-slate-600/30">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSubscriptionActive(subscription.id)}
                      className={`text-xs h-8 ${
                        subscription.active 
                          ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-400/10'
                      }`}
                    >
                      <Bell size={12} className="mr-1" />
                      {subscription.active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 text-xs h-8"
                    >
                      <Settings size={12} className="mr-1" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSubscription(subscription.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-8"
                    >
                      <Trash2 size={12} className="mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

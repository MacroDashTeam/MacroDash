import { Clock, ExternalLink, Newspaper, BarChart3, Calendar } from 'lucide-react'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { SentimentAnalysis } from './SentimentAnalysis'
import { DataReleaseSchedule } from './DataReleaseSchedule'

const newsData = [
  {
    id: 1,
    title: "Federal Reserve Signals Potential Rate Cut in Q4",
    summary: "Fed officials hint at possible interest rate reduction following recent economic data showing cooling inflation trends and stable employment figures.",
    time: "2 hours ago",
    source: "Financial Times",
    impact: "positive",
    category: "monetary-policy"
  },
  {
    id: 2,
    title: "Tech Sector Rally Continues with AI Optimism",
    summary: "Major technology stocks surge as artificial intelligence investments show promising early returns, driving sector-wide gains.",
    time: "4 hours ago",
    source: "Bloomberg",
    impact: "positive",
    category: "technology"
  },
  {
    id: 3,
    title: "Energy Prices Stabilize After Supply Chain Concerns",
    summary: "Oil and gas prices find stability following resolution of key supply chain disruptions in the Middle East region.",
    time: "6 hours ago",
    source: "Reuters",
    impact: "neutral",
    category: "energy"
  },
  {
    id: 4,
    title: "Consumer Spending Shows Resilience Despite Economic Headwinds",
    summary: "Latest retail sales data indicates continued consumer confidence in face of market uncertainty and inflationary pressures.",
    time: "8 hours ago",
    source: "Wall Street Journal",
    impact: "positive",
    category: "consumer"
  },
  {
    id: 5,
    title: "Manufacturing PMI Beats Expectations Across Regions",
    summary: "Global manufacturing activity shows signs of recovery with PMI readings exceeding forecasts in key economic regions.",
    time: "10 hours ago",
    source: "Financial Times",
    impact: "positive",
    category: "manufacturing"
  },
  {
    id: 6,
    title: "Cryptocurrency Market Volatility Impacts Tech Stocks",
    summary: "Digital asset market fluctuations create ripple effects across technology sector, particularly affecting blockchain companies.",
    time: "12 hours ago",
    source: "CNBC",
    impact: "negative",
    category: "technology"
  }
]

export function NewsFeed() {
  const [activeTab, setActiveTab] = useState("news")

  return (
    <div className="h-full bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-blue-900/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="p-6 border-b border-slate-600/30">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger 
              value="news" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Newspaper size={16} />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sentiment" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 size={16} />
              <span className="hidden sm:inline">Sentiment</span>
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 p-6 overflow-auto min-h-0">
          <TabsContent value="news" className="h-full mt-0">
            <div className="flex flex-col h-full">
              <h3 className="text-white mb-4 flex-shrink-0">Market News & Analysis</h3>
              <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
                {newsData.map((news) => (
                  <div 
                    key={news.id}
                    className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/20 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white text-sm flex-1 pr-2 leading-relaxed">{news.title}</h4>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        news.impact === 'positive' ? 'bg-green-400' :
                        news.impact === 'negative' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`}></div>
                    </div>
                    <p className="text-slate-300 text-xs mb-3 leading-relaxed">{news.summary}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={12} />
                        <span>{news.time}</span>
                        <span>•</span>
                        <span>{news.source}</span>
                      </div>
                      <ExternalLink size={12} className="text-blue-400 hover:text-blue-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="h-full mt-0 overflow-auto">
            <SentimentAnalysis />
          </TabsContent>

          <TabsContent value="schedule" className="h-full mt-0 overflow-auto">
            <DataReleaseSchedule />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
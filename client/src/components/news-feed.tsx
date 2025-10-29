import { useQuery } from '@tanstack/react-query'
import { ExternalLink, ChevronRight } from 'lucide-react'
import { useState } from 'react'

type NewsItem = {
  title: string
  summary: string
  source: string
  time_published: string
  url: string
  overall_sentiment_label: string
}

type AlphaVantageNewsResponse = {
  status: string
  data: {
    feed: NewsItem[]
  }
  timestamp: string
}

async function fetchNews(): Promise<NewsItem[]> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${API_BASE}/api/alpha-vantage/news/?limit=20`)
  if (!response.ok) throw new Error('Failed to fetch news')
  const data: AlphaVantageNewsResponse = await response.json()
  return data.data.feed || []
}

function NewsCard({ news }: { news: NewsItem }) {
  const sentimentColor =
    news.overall_sentiment_label?.includes('Bullish') ? 'bg-green-500' :
    news.overall_sentiment_label?.includes('Bearish') ? 'bg-red-500' :
    'bg-yellow-500'

  const timeAgo = (dateString: string) => {
    // Parse Alpha Vantage time format: YYYYMMDDTHHMMSS
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    const hour = dateString.substring(9, 11)
    const minute = dateString.substring(11, 13)
    const second = dateString.substring(13, 15)

    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900/80 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${sentimentColor}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-zinc-200 leading-snug line-clamp-2">
              {news.title}
            </h3>
          </div>

          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
            {news.summary}
          </p>

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span>{news.source}</span>
              <span>•</span>
              <span>{timeAgo(news.time_published)}</span>
            </div>

            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>Read</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewsFeed() {
  const [showAll, setShowAll] = useState(false)

  const { data: news, isLoading, isError } = useQuery<NewsItem[]>({
    queryKey: ['news-feed'],
    queryFn: fetchNews,
    refetchInterval: 300000, // Refresh every 5 minutes
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">📰</div>
          <h2 className="text-lg font-semibold">Latest News</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !news) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">📰</div>
          <h2 className="text-lg font-semibold">Latest News</h2>
        </div>
        <p className="text-red-400 text-sm">Failed to load news</p>
      </div>
    )
  }

  const displayedNews = showAll ? news : news.slice(0, 4)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl">📰</div>
          <h2 className="text-lg font-semibold">Latest News</h2>
        </div>
        <div className="text-xs text-zinc-500">{news.length} articles</div>
      </div>

      <div className="space-y-3">
        {displayedNews.map((item, index) => (
          <NewsCard key={index} news={item} />
        ))}
      </div>

      {news.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors py-2 hover:bg-zinc-800/30 rounded"
        >
          <span>{showAll ? 'Show Less' : `Show ${news.length - 4} More Articles`}</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
        </button>
      )}
    </div>
  )
}

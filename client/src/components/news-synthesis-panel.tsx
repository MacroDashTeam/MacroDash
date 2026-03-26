import { useQuery } from '@tanstack/react-query'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface NewsSynthesis {
  symbol: string
  stock_name: string
  impact_score: number
  summary: string
  key_developments: string[]
  entities_mentioned: string[]
  articles_analyzed: number
  updated_at: string
}

export default function NewsSynthesisPanel() {
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['agent-news-synthesis'],
    queryFn: async () => {
      const res = await fetch('/api/agent/news-synthesis/')
      if (!res.ok) throw new Error('Failed to fetch news synthesis')
      return res.json()
    },
    refetchInterval: 6 * 60 * 60 * 1000, // 6 hours
  })

  const syntheses = data?.syntheses || []

  const getImpactColor = (score: number) => {
    if (score > 0.3) return 'text-green-600'
    if (score < -0.3) return 'text-red-600'
    return 'text-yellow-600'
  }


  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">News Synthesis</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">News Synthesis</h2>
        <p className="text-gray-500 text-sm">
          Unable to load news synthesis. Please check back soon.
        </p>
      </Card>
    )
  }

  if (syntheses.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">News Synthesis</h2>
        <p className="text-gray-500 text-sm">
          No synthesis available yet. Agent runs every 6 hours.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">News Synthesis</h2>
      <div className="space-y-3">
        {syntheses.map((synth: NewsSynthesis) => (
          <div
            key={synth.symbol}
            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition"
            onClick={() =>
              setExpandedSymbol(expandedSymbol === synth.symbol ? null : synth.symbol)
            }
          >
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-20">
                  <p className="font-bold text-lg">{synth.symbol}</p>
                  <p className="text-sm text-gray-500">{synth.stock_name}</p>
                </div>

                {/* Impact Score Meter */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative">
                      <div
                        className="absolute h-full w-1 bg-black rounded-full"
                        style={{
                          left: `${((synth.impact_score + 1) / 2) * 100}%`,
                          transform: 'translateX(-50%)',
                        }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm font-semibold w-12 text-right ${getImpactColor(
                        synth.impact_score
                      )}`}
                    >
                      {synth.impact_score > 0 ? '+' : ''}
                      {synth.impact_score.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-gray-500">
                {expandedSymbol === synth.symbol ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Summary Preview */}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {synth.summary || 'No summary available'}
            </p>

            {/* Expanded Details */}
            {expandedSymbol === synth.symbol && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {/* Full Summary */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Summary:
                  </p>
                  <p className="text-sm text-gray-600">{synth.summary}</p>
                </div>

                {/* Key Developments */}
                {synth.key_developments && synth.key_developments.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Key Developments:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {synth.key_developments.slice(0, 3).map((dev, i) => (
                        <li key={i} className="flex gap-2">
                          <span>•</span>
                          <span>{dev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Entities Mentioned */}
                {synth.entities_mentioned && synth.entities_mentioned.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Mentioned Entities:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {synth.entities_mentioned.slice(0, 5).map((entity, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs"
                        >
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Articles Count */}
                <p className="text-xs text-gray-500">
                  {synth.articles_analyzed} articles analyzed •{' '}
                  {new Date(synth.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

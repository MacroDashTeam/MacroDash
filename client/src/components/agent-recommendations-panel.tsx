import { useQuery } from '@tanstack/react-query'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Recommendation {
  symbol: string
  stock_name: string
  recommendation: 'BUY' | 'SELL' | 'HOLD'
  confidence_score: number
  reasoning: string[]
  signals: {
    bullish: string[]
    bearish: string[]
  }
  updated_at: string
}

export default function AgentRecommendationsPanel() {
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['agent-recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/agent/portfolio/')
      if (!res.ok) throw new Error('Failed to fetch recommendations')
      return res.json()
    },
    refetchInterval: 6 * 60 * 60 * 1000, // 6 hours
  })

  const recommendations = data?.recommendations || []

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return 'bg-green-100 text-green-800'
      case 'SELL':
        return 'bg-red-100 text-red-800'
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">AI Agent Recommendations</h2>
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
        <h2 className="text-xl font-semibold mb-4">AI Agent Recommendations</h2>
        <p className="text-gray-500 text-sm">
          Unable to load recommendations. Please check back soon.
        </p>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">AI Agent Recommendations</h2>
        <p className="text-gray-500 text-sm">
          No recommendations available yet. Agent runs every 6 hours.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">AI Agent Recommendations</h2>
      <div className="space-y-3">
        {recommendations.map((rec: Recommendation) => (
          <div
            key={rec.symbol}
            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition"
            onClick={() =>
              setExpandedSymbol(expandedSymbol === rec.symbol ? null : rec.symbol)
            }
          >
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-20">
                  <p className="font-bold text-lg">{rec.symbol}</p>
                  <p className="text-sm text-gray-500">{rec.stock_name}</p>
                </div>
                <Badge className={getRecommendationColor(rec.recommendation)}>
                  {rec.recommendation}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          rec.recommendation === 'BUY'
                            ? 'bg-green-500'
                            : rec.recommendation === 'SELL'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{
                          width: `${rec.confidence_score * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">
                      {(rec.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-gray-500">
                {expandedSymbol === rec.symbol ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedSymbol === rec.symbol && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {/* Reasoning */}
                {rec.reasoning && rec.reasoning.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Reasoning:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {rec.reasoning.map((reason, i) => (
                        <li key={i} className="flex gap-2">
                          <span>•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Signals */}
                <div className="grid grid-cols-2 gap-4">
                  {rec.signals?.bullish && rec.signals.bullish.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-green-700 mb-1">
                        ✓ Bullish Signals
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {rec.signals.bullish.slice(0, 2).map((sig, i) => (
                          <li key={i}>{sig}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {rec.signals?.bearish && rec.signals.bearish.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-1">
                        ✗ Bearish Signals
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {rec.signals.bearish.slice(0, 2).map((sig, i) => (
                          <li key={i}>{sig}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Last Updated */}
                <p className="text-xs text-gray-500">
                  Last analyzed:{' '}
                  {new Date(rec.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

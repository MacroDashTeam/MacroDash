import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

const sentimentData = [
  { sector: 'Technology', sentiment: 78, color: '#10B981' },
  { sector: 'Healthcare', sentiment: 65, color: '#3B82F6' },
  { sector: 'Financial', sentiment: 42, color: '#F59E0B' },
  { sector: 'Energy', sentiment: -15, color: '#EF4444' },
  { sector: 'Consumer', sentiment: 58, color: '#8B5CF6' },
  { sector: 'Industrial', sentiment: 35, color: '#06B6D4' },
  { sector: 'Materials', sentiment: 22, color: '#84CC16' },
  { sector: 'Utilities', sentiment: -8, color: '#F97316' },
]

export function SentimentAnalysis() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h4 className="text-white text-sm mb-2">Market Sentiment by Sector</h4>
        <p className="text-slate-400 text-xs">Real-time sentiment analysis from news and social media</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="150%">
          <BarChart data={sentimentData} margin={{ top: 10, right: 10, left: 10, bottom: 80 }}>
            <XAxis 
              dataKey="sector" 
              stroke="#94A3B8" 
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={10}
              domain={[-30, 100]}
            />
            <Bar dataKey="sentiment" radius={[2, 2, 0, 0]}>
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded"></div>
            <span className="text-slate-300">Bullish (&gt;50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span className="text-slate-300">Bearish (&lt;0)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
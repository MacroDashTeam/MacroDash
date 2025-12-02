import { Calendar, Clock, Building, TrendingUp } from 'lucide-react'

const upcomingReleases = [
  {
    date: '2024-09-25',
    time: '08:30',
    event: 'Consumer Confidence Index',
    organization: 'Bureau of Economic Analysis',
    impact: 'high',
    previous: '103.2',
    forecast: '104.1'
  },
  {
    date: '2024-09-26',
    time: '14:00',
    event: 'FOMC Meeting Minutes',
    organization: 'Federal Reserve',
    impact: 'high',
    previous: '-',
    forecast: '-'
  },
  {
    date: '2024-09-27',
    time: '08:30',
    event: 'GDP Growth Rate (QoQ)',
    organization: 'Bureau of Economic Analysis',
    impact: 'high',
    previous: '2.1%',
    forecast: '2.3%'
  },
  {
    date: '2024-09-30',
    time: '10:00',
    event: 'Manufacturing PMI',
    organization: 'Institute for Supply Management',
    impact: 'medium',
    previous: '47.2',
    forecast: '47.8'
  },
  {
    date: '2024-10-01',
    time: '08:30',
    event: 'Non-Farm Payrolls',
    organization: 'Bureau of Labor Statistics',
    impact: 'high',
    previous: '187K',
    forecast: '195K'
  },
  {
    date: '2024-10-02',
    time: '09:00',
    event: 'Global Financial Stability Report',
    organization: 'International Monetary Fund',
    impact: 'medium',
    previous: '-',
    forecast: '-'
  }
]

export function DataReleaseSchedule() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/20'
      default: return 'text-slate-400 bg-slate-400/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h4 className="text-white text-sm mb-2">Economic Data Release Schedule</h4>
        <p className="text-slate-400 text-xs">Upcoming key economic indicators and central bank events</p>
      </div>
      
      <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
        {upcomingReleases.map((release, index) => (
          <div key={index} className="bg-slate-800/30 rounded-lg p-3 border border-slate-600/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h5 className="text-white text-xs mb-1">{release.event}</h5>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{formatDate(release.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{release.time} EST</span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${getImpactColor(release.impact)}`}>
                {release.impact.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <Building size={10} className="text-slate-500" />
              <span className="text-slate-400 text-xs">{release.organization}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Previous:</span>
                <span className="text-slate-300 ml-1">{release.previous}</span>
              </div>
              <div>
                <span className="text-slate-500">Forecast:</span>
                <span className="text-slate-300 ml-1">{release.forecast}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
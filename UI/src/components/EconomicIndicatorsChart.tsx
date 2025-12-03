import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from './ui/button'
import { Settings, Download, RefreshCw } from 'lucide-react'
import { useState } from 'react'

const data = [
  { month: 'Jan', inflation: 3.12, unemployment: 3.74, gdp: 2.31, date: '2024-01' },
  { month: 'Feb', inflation: 3.18, unemployment: 3.81, gdp: 2.15, date: '2024-02' },
  { month: 'Mar', inflation: 3.45, unemployment: 3.79, gdp: 2.42, date: '2024-03' },
  { month: 'Apr', inflation: 3.38, unemployment: 3.87, gdp: 2.28, date: '2024-04' },
  { month: 'May', inflation: 3.29, unemployment: 3.95, gdp: 2.51, date: '2024-05' },
  { month: 'Jun', inflation: 3.22, unemployment: 3.83, gdp: 2.18, date: '2024-06' },
  { month: 'Jul', inflation: 3.15, unemployment: 3.76, gdp: 2.33, date: '2024-07' },
  { month: 'Aug', inflation: 3.08, unemployment: 3.69, gdp: 2.47, date: '2024-08' },
  { month: 'Sep', inflation: 3.11, unemployment: 3.72, gdp: 2.39, date: '2024-09' },
  { month: 'Oct', inflation: 3.25, unemployment: 3.85, gdp: 2.25, date: '2024-10' },
  { month: 'Nov', inflation: 3.19, unemployment: 3.78, gdp: 2.41, date: '2024-11' },
  { month: 'Dec', inflation: 3.13, unemployment: 3.71, gdp: 2.36, date: '2024-12' },
]

export function EconomicIndicatorsChart() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="h-full bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-blue-900/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-600/30 flex-shrink-0">
        <div>
          <h3 className="text-white text-lg">Key Economic Indicators</h3>
          <p className="text-slate-400 text-sm">Federal Reserve & Economic Data</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings size={16} />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <RefreshCw size={16} />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <Download size={16} />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4 flex-1 flex flex-col">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <defs>
              <linearGradient id="inflationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="unemploymentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gdpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#475569" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="#94A3B8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
              labelStyle={{ color: '#94A3B8' }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '15px', 
                fontSize: '12px',
                color: '#94A3B8'
              }}
              iconType="line"
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
            />
            <Line 
              type="monotone" 
              dataKey="inflation" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Inflation Rate (%)"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2, fill: '#1e40af' }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="unemployment" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Unemployment (%)"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#059669' }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="gdp" 
              stroke="#F59E0B" 
              strokeWidth={3}
              name="GDP Growth (%)"
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#F59E0B', strokeWidth: 2, fill: '#d97706' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {isEditing && (
        <div className="border-t border-slate-600/30 p-4 bg-slate-800/50 flex-shrink-0">
          <p className="text-slate-400 text-sm">Chart customization panel - Select indicators to display</p>
        </div>
      )}
    </div>
  )
}
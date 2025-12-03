import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from './ui/button'
import { Settings, Download, RefreshCw, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const data = [
  { time: '09:30', sp500: 4748.12, nasdaq: 14798.45, dow: 37482.33 },
  { time: '09:45', sp500: 4751.87, nasdaq: 14812.78, dow: 37503.21 },
  { time: '10:00', sp500: 4755.43, nasdaq: 14821.65, dow: 37518.76 },
  { time: '10:15', sp500: 4759.21, nasdaq: 14838.92, dow: 37531.44 },
  { time: '10:30', sp500: 4762.18, nasdaq: 14847.33, dow: 37542.89 },
  { time: '10:45', sp500: 4758.76, nasdaq: 14834.21, dow: 37529.67 },
  { time: '11:00', sp500: 4761.45, nasdaq: 14851.78, dow: 37547.12 },
  { time: '11:15', sp500: 4764.33, nasdaq: 14865.44, dow: 37558.93 },
  { time: '11:30', sp500: 4759.87, nasdaq: 14842.67, dow: 37535.78 },
  { time: '11:45', sp500: 4762.91, nasdaq: 14856.23, dow: 37549.44 },
  { time: '12:00', sp500: 4766.55, nasdaq: 14873.91, dow: 37562.87 },
  { time: '12:15', sp500: 4763.22, nasdaq: 14861.45, dow: 37551.23 },
  { time: '12:30', sp500: 4767.88, nasdaq: 14879.67, dow: 37568.91 },
  { time: '12:45', sp500: 4765.43, nasdaq: 14871.23, dow: 37559.77 },
  { time: '13:00', sp500: 4769.12, nasdaq: 14887.45, dow: 37575.33 },
  { time: '13:15', sp500: 4771.67, nasdaq: 14893.78, dow: 37582.11 },
]

export function StockMarketChart() {
  const [isEditing, setIsEditing] = useState(false)

  const currentSP500 = data[data.length - 1].sp500
  const previousSP500 = data[0].sp500
  const changePercent = ((currentSP500 - previousSP500) / previousSP500 * 100).toFixed(2)

  return (
    <div className="h-full bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-blue-900/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-600/30 flex-shrink-0">
        <div>
          <h3 className="text-white text-lg">Major Stock Indices</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-400 text-sm">Live Market Data</p>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-green-400" />
              <span className="text-green-400 text-sm">+{changePercent}%</span>
            </div>
          </div>
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
              <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="nasdaqGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="dowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#475569" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#94A3B8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 50', 'dataMax + 50']}
              tickFormatter={(value) => value.toLocaleString()}
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
              formatter={(value, name) => [value.toLocaleString(), name]}
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
              dataKey="sp500" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="S&P 500"
              dot={false}
              activeDot={{ r: 5, stroke: '#EF4444', strokeWidth: 2, fill: '#dc2626' }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="nasdaq" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              name="NASDAQ"
              dot={false}
              activeDot={{ r: 5, stroke: '#8B5CF6', strokeWidth: 2, fill: '#7c3aed' }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="dow" 
              stroke="#06B6D4" 
              strokeWidth={3}
              name="Dow Jones"
              dot={false}
              activeDot={{ r: 5, stroke: '#06B6D4', strokeWidth: 2, fill: '#0891b2' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {isEditing && (
        <div className="border-t border-slate-600/30 p-4 bg-slate-800/50 flex-shrink-0">
          <p className="text-slate-400 text-sm">Chart customization panel - Select indices and timeframes</p>
        </div>
      )}
    </div>
  )
}
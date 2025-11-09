import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BookmarkPlus } from 'lucide-react'
import { saveTechnicalIndicatorChart } from '@/lib/save-to-dashboard'

interface TechnicalIndicatorsProps {
  symbol: string
  period?: string
}

interface RSIData {
  timeperiod: number
  values: number[]
  latest: number
  description: string
}

interface MACDData {
  fastperiod: number
  slowperiod: number
  signalperiod: number
  macd: number[]
  signal: number[]
  histogram: number[]
  latest_macd: number
  latest_signal: number
  latest_histogram: number
  description: string
}

interface BollingerBandsData {
  timeperiod: number
  nbdevup: number
  nbdevdn: number
  upper_band: number[]
  middle_band: number[]
  lower_band: number[]
  latest_upper: number
  latest_middle: number
  latest_lower: number
  description: string
}

interface SMAData {
  sma_20: { values: number[]; latest: number }
  sma_50: { values: number[]; latest: number }
  sma_200: { values: number[]; latest: number }
  description: string
}

interface EMAData {
  ema_12: { values: number[]; latest: number }
  ema_26: { values: number[]; latest: number }
  ema_50: { values: number[]; latest: number }
  description: string
}

interface IndicatorsData {
  symbol: string
  period: string
  data_points: number
  rsi: RSIData
  macd: MACDData
  bbands: BollingerBandsData
  sma: SMAData
  ema: EMAData
  dates: string[]
}

export function TechnicalIndicators({ symbol, period = '1y' }: TechnicalIndicatorsProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<IndicatorsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        setLoading(true)
        setError(null)
        const API_BASE = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${API_BASE}/api/technical-indicators/${symbol}/?period=${period}`)
        const result = await response.json()

        if (result.status === 'success') {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch technical indicators')
        }
      } catch (err) {
        setError('Failed to fetch technical indicators')
        console.error('Error fetching technical indicators:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchIndicators()
  }, [symbol, period])

  const handleSaveIndicator = async (indicatorType: string, period?: number) => {
    const success = await saveTechnicalIndicatorChart(symbol, indicatorType, period)
    if (success) {
      alert(`${indicatorType} chart saved to Dashboard!`)
    } else {
      alert(`Failed to save ${indicatorType} chart to Dashboard`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
          <CardDescription className="text-red-500">{error || 'No data available'}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Prepare chart data
  const rsiChartData = data.dates.slice(-data.rsi.values.length).map((date, index) => ({
    date: new Date(date).toLocaleDateString(),
    RSI: data.rsi.values[index]
  }))

  const macdChartData = data.dates.slice(-data.macd.macd.length).map((date, index) => ({
    date: new Date(date).toLocaleDateString(),
    MACD: data.macd.macd[index],
    Signal: data.macd.signal[index],
    Histogram: data.macd.histogram[index]
  }))

  const bbandsChartData = data.dates.slice(-data.bbands.upper_band.length).map((date, index) => ({
    date: new Date(date).toLocaleDateString(),
    Upper: data.bbands.upper_band[index],
    Middle: data.bbands.middle_band[index],
    Lower: data.bbands.lower_band[index]
  }))

  const smaChartData = data.dates.slice(-Math.max(
    data.sma.sma_20.values.length,
    data.sma.sma_50.values.length,
    data.sma.sma_200.values.length
  )).map((date, index) => ({
    date: new Date(date).toLocaleDateString(),
    SMA20: data.sma.sma_20.values[index] || null,
    SMA50: data.sma.sma_50.values[index] || null,
    SMA200: data.sma.sma_200.values[index] || null
  }))

  const emaChartData = data.dates.slice(-Math.max(
    data.ema.ema_12.values.length,
    data.ema.ema_26.values.length,
    data.ema.ema_50.values.length
  )).map((date, index) => ({
    date: new Date(date).toLocaleDateString(),
    EMA12: data.ema.ema_12.values[index] || null,
    EMA26: data.ema.ema_26.values[index] || null,
    EMA50: data.ema.ema_50.values[index] || null
  }))

  // RSI interpretation
  const getRSIBadge = (rsi: number) => {
    if (rsi > 70) return <Badge variant="destructive">Overbought</Badge>
    if (rsi < 30) return <Badge variant="default">Oversold</Badge>
    return <Badge variant="secondary">Neutral</Badge>
  }

  // MACD interpretation
  const getMACDBadge = (macd: number, signal: number) => {
    if (macd > signal) return <Badge variant="default">Bullish</Badge>
    if (macd < signal) return <Badge variant="destructive">Bearish</Badge>
    return <Badge variant="secondary">Neutral</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Indicators - {data.symbol}</CardTitle>
        <CardDescription>
          Period: {period.toUpperCase()} | Data Points: {data.data_points}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rsi" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rsi">RSI</TabsTrigger>
            <TabsTrigger value="macd">MACD</TabsTrigger>
            <TabsTrigger value="bbands">Bollinger Bands</TabsTrigger>
            <TabsTrigger value="sma">SMA</TabsTrigger>
            <TabsTrigger value="ema">EMA</TabsTrigger>
          </TabsList>

          <TabsContent value="rsi" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{data.rsi.description}</p>
                <p className="text-2xl font-bold mt-2">
                  RSI: {data.rsi.latest.toFixed(2)} {getRSIBadge(data.rsi.latest)}
                </p>
              </div>
              <button
                onClick={() => handleSaveIndicator('RSI', data.rsi.timeperiod)}
                className="p-2 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                title="Save to Dashboard"
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rsiChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" label="Overbought" />
                <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" label="Oversold" />
                <Line type="monotone" dataKey="RSI" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="macd" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{data.macd.description}</p>
                <p className="text-2xl font-bold mt-2">
                  MACD: {data.macd.latest_macd.toFixed(2)} {getMACDBadge(data.macd.latest_macd, data.macd.latest_signal)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Signal: {data.macd.latest_signal.toFixed(2)} | Histogram: {data.macd.latest_histogram.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleSaveIndicator('MACD')}
                className="p-2 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                title="Save to Dashboard"
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={macdChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="MACD" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Signal" stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Histogram" stroke="#ffc658" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bbands" className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{data.bbands.description}</p>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Upper Band</p>
                    <p className="text-lg font-bold">${data.bbands.latest_upper.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Middle Band</p>
                    <p className="text-lg font-bold">${data.bbands.latest_middle.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lower Band</p>
                    <p className="text-lg font-bold">${data.bbands.latest_lower.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSaveIndicator('BBANDS', data.bbands.timeperiod)}
                className="p-2 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                title="Save to Dashboard"
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bbandsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Upper" stroke="#ff0000" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Middle" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Lower" stroke="#00ff00" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="sma" className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{data.sma.description}</p>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">SMA 20</p>
                    <p className="text-lg font-bold">${data.sma.sma_20.latest.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SMA 50</p>
                    <p className="text-lg font-bold">${data.sma.sma_50.latest.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SMA 200</p>
                    <p className="text-lg font-bold">${data.sma.sma_200.latest.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSaveIndicator('SMA', 20)}
                className="p-2 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                title="Save to Dashboard"
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={smaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="SMA20" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="SMA50" stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="SMA200" stroke="#ffc658" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="ema" className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{data.ema.description}</p>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">EMA 12</p>
                    <p className="text-lg font-bold">${data.ema.ema_12.latest.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">EMA 26</p>
                    <p className="text-lg font-bold">${data.ema.ema_26.latest.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">EMA 50</p>
                    <p className="text-lg font-bold">${data.ema.ema_50.latest.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSaveIndicator('EMA', 12)}
                className="p-2 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                title="Save to Dashboard"
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="EMA12" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="EMA26" stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="EMA50" stroke="#ffc658" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

import { useState, useEffect } from 'react'
import { Clock, Circle } from 'lucide-react'

interface MarketHours {
  name: string
  timezone: string
  openTime: string // HH:MM in local timezone
  closeTime: string // HH:MM in local timezone
  daysOpen: number[] // 0-6, Sunday = 0
  utcOffset: number // hours offset from UTC
}

const MARKET_SCHEDULES: MarketHours[] = [
  {
    name: 'NYSE/NASDAQ',
    timezone: 'EST',
    openTime: '09:30',
    closeTime: '16:00',
    daysOpen: [1, 2, 3, 4, 5], // Mon-Fri
    utcOffset: -5
  },
  {
    name: 'Tokyo (TSE)',
    timezone: 'JST',
    openTime: '09:00',
    closeTime: '15:00',
    daysOpen: [1, 2, 3, 4, 5],
    utcOffset: 9
  },
  {
    name: 'Hong Kong (HKEX)',
    timezone: 'HKT',
    openTime: '09:30',
    closeTime: '16:00',
    daysOpen: [1, 2, 3, 4, 5],
    utcOffset: 8
  },
  {
    name: 'Shanghai (SSE)',
    timezone: 'CST',
    openTime: '09:30',
    closeTime: '15:00',
    daysOpen: [1, 2, 3, 4, 5],
    utcOffset: 8
  },
  {
    name: 'London (LSE)',
    timezone: 'GMT',
    openTime: '08:00',
    closeTime: '16:30',
    daysOpen: [1, 2, 3, 4, 5],
    utcOffset: 0
  },
  {
    name: 'Frankfurt (FSE)',
    timezone: 'CET',
    openTime: '09:00',
    closeTime: '17:30',
    daysOpen: [1, 2, 3, 4, 5],
    utcOffset: 1
  },
  {
    name: 'Sydney (ASX)',
    timezone: 'AEST',
    openTime: '10:00',
    closeTime: '16:00',
    daysOpen: [1, 2, 3, 4, 5],
    utcOffset: 10
  },
]

function isMarketOpen(market: MarketHours, now: Date): boolean {
  const dayOfWeek = now.getUTCDay()

  // Check if market is open today
  if (!market.daysOpen.includes(dayOfWeek)) {
    return false
  }

  // Convert current UTC time to market's timezone
  const marketHour = now.getUTCHours() + market.utcOffset
  const marketMinute = now.getUTCMinutes()
  const marketTime = marketHour * 60 + marketMinute

  // Parse open and close times
  const [openHour, openMin] = market.openTime.split(':').map(Number)
  const [closeHour, closeMin] = market.closeTime.split(':').map(Number)
  const openTime = openHour * 60 + openMin
  const closeTime = closeHour * 60 + closeMin

  // Handle day wrap (e.g., if marketHour becomes 25:00)
  const adjustedMarketTime = ((marketTime % 1440) + 1440) % 1440

  return adjustedMarketTime >= openTime && adjustedMarketTime < closeTime
}

function getNextOpenTime(market: MarketHours, now: Date): string {
  const currentDay = now.getUTCDay()
  const currentHour = now.getUTCHours() + market.utcOffset
  const currentMinute = now.getUTCMinutes()

  // Find next open day
  let daysUntilOpen = 0
  let nextDay = currentDay

  for (let i = 0; i < 7; i++) {
    nextDay = (currentDay + i) % 7
    if (market.daysOpen.includes(nextDay)) {
      // If it's today and market hasn't closed yet
      if (i === 0) {
        const [openHour, openMin] = market.openTime.split(':').map(Number)
        const currentTime = currentHour * 60 + currentMinute
        const openTime = openHour * 60 + openMin

        if (currentTime < openTime) {
          daysUntilOpen = 0
          break
        }
      } else {
        daysUntilOpen = i
        break
      }
    }
  }

  const [openHour, openMin] = market.openTime.split(':').map(Number)

  if (daysUntilOpen === 0) {
    const hoursUntil = openHour - (currentHour % 24)
    const minutesUntil = openMin - currentMinute

    if (hoursUntil > 0 || (hoursUntil === 0 && minutesUntil > 0)) {
      const totalMinutes = hoursUntil * 60 + minutesUntil
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      if (hours > 0) {
        return `in ${hours}h ${minutes}m`
      }
      return `in ${minutes}m`
    }
  }

  if (daysUntilOpen === 1) return 'Tomorrow'
  if (daysUntilOpen > 1) return `in ${daysUntilOpen} days`

  return 'Soon'
}

function MarketStatusCard({ market }: { market: MarketHours }) {
  const [now, setNow] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [nextOpen, setNextOpen] = useState('')

  useEffect(() => {
    const updateStatus = () => {
      const currentTime = new Date()
      setNow(currentTime)
      setIsOpen(isMarketOpen(market, currentTime))
      setNextOpen(getNextOpenTime(market, currentTime))
    }

    updateStatus()
    const interval = setInterval(updateStatus, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [market])

  // Get current time in market's timezone
  const marketHour = (now.getUTCHours() + market.utcOffset + 24) % 24
  const marketMinute = now.getUTCMinutes()
  const marketTimeStr = `${marketHour.toString().padStart(2, '0')}:${marketMinute.toString().padStart(2, '0')}`

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900/80 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{market.name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{market.timezone}</p>
        </div>
        <div className="flex items-center gap-2">
          <Circle
            className={`w-2 h-2 fill-current ${
              isOpen ? 'text-green-500' : 'text-red-500'
            }`}
          />
          <span className={`text-sm font-medium ${
            isOpen ? 'text-green-500' : 'text-red-500'
          }`}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-zinc-400">
          <span>Local Time:</span>
          <span className="font-mono">{marketTimeStr}</span>
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span>Trading Hours:</span>
          <span className="font-mono">{market.openTime} - {market.closeTime}</span>
        </div>

        {!isOpen && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="text-zinc-400">Next Open:</span>
            <span className="font-semibold text-blue-400">{nextOpen}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketSchedule() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const openMarkets = MARKET_SCHEDULES.filter(m => isMarketOpen(m, now))
  const closedMarkets = MARKET_SCHEDULES.filter(m => !isMarketOpen(m, now))

  return (
    <div className="space-y-6">
      {/* Header with current time */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Global Market Hours</h2>
          <p className="text-zinc-400 text-sm mt-1">Real-time market status across the world</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="font-mono text-sm">
            {now.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })} UTC
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <Circle className="w-3 h-3 fill-green-500 text-green-500" />
          <span className="text-sm font-medium text-green-500">
            {openMarkets.length} Markets Open
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <Circle className="w-3 h-3 fill-red-500 text-red-500" />
          <span className="text-sm font-medium text-red-500">
            {closedMarkets.length} Markets Closed
          </span>
        </div>
      </div>

      {/* Open Markets */}
      {openMarkets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Circle className="w-3 h-3 fill-green-500 text-green-500" />
            Currently Open
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openMarkets.map(market => (
              <MarketStatusCard key={market.name} market={market} />
            ))}
          </div>
        </div>
      )}

      {/* Closed Markets */}
      {closedMarkets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Circle className="w-3 h-3 fill-red-500 text-red-500" />
            Currently Closed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedMarkets.map(market => (
              <MarketStatusCard key={market.name} market={market} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

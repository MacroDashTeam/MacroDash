/**
 * Utility for saving charts to Dashboard from any page
 */

interface SaveChartOptions {
  chartName: string
  symbols: string[]
  formulas: string[]
  seriesIds: string[]
  sourceType?: string
  seriesMetadata?: Record<string, {
    name: string
    frequency: string
    units: string
  }>
}

export async function saveChartToDashboard(options: SaveChartOptions): Promise<boolean> {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL

    const res = await fetch(`${API_BASE}/api/charts/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart_name: options.chartName,
        series_ids: options.seriesIds,
        series_metadata: options.seriesMetadata || {},
        source_type: options.sourceType || 'custom_analysis',
        formulas: options.formulas,
        symbols: options.symbols
      })
    })

    if (!res.ok) {
      throw new Error('Failed to save chart')
    }

    // Dispatch event to notify dashboard to refresh
    window.dispatchEvent(new CustomEvent('chart-saved'))

    return true
  } catch (error) {
    console.error('Save to dashboard error:', error)
    return false
  }
}

/**
 * Save a simple stock price chart
 */
export async function saveStockPriceChart(symbol: string, stockName?: string): Promise<boolean> {
  return saveChartToDashboard({
    chartName: `${symbol} Price`,
    symbols: [symbol],
    formulas: [`${symbol} = price(${symbol})`],
    seriesIds: [symbol],
    seriesMetadata: {
      [symbol]: {
        name: stockName || symbol,
        frequency: 'Daily',
        units: 'USD'
      }
    }
  })
}

/**
 * Save a crypto price chart
 */
export async function saveCryptoPriceChart(symbol: string, cryptoName?: string): Promise<boolean> {
  return saveChartToDashboard({
    chartName: `${symbol} Price (Crypto)`,
    symbols: [symbol],
    formulas: [`${symbol} = crypto_price(${symbol})`],
    seriesIds: [symbol],
    sourceType: 'crypto',
    seriesMetadata: {
      [symbol]: {
        name: cryptoName || symbol,
        frequency: 'Real-time',
        units: 'USD'
      }
    }
  })
}

/**
 * Save a technical indicator chart
 */
export async function saveTechnicalIndicatorChart(
  symbol: string,
  indicator: string,
  period?: number,
  stockName?: string
): Promise<boolean> {
  const seriesIds = [symbol]
  const formulas = [`${symbol} = price(${symbol})`]
  const seriesMetadata: Record<string, any> = {
    [symbol]: {
      name: stockName || symbol,
      frequency: 'Daily',
      units: 'USD'
    }
  }

  // Add indicator formula based on type
  if (indicator === 'SMA' && period) {
    const indicatorId = `SMA_${period}`
    seriesIds.push(indicatorId)
    formulas.push(`${indicatorId} = sma(${symbol}, ${period})`)
    seriesMetadata[indicatorId] = {
      name: `${period}-day SMA`,
      frequency: 'Daily',
      units: 'USD'
    }
  } else if (indicator === 'EMA' && period) {
    const indicatorId = `EMA_${period}`
    seriesIds.push(indicatorId)
    formulas.push(`${indicatorId} = ema(${symbol}, ${period})`)
    seriesMetadata[indicatorId] = {
      name: `${period}-day EMA`,
      frequency: 'Daily',
      units: 'USD'
    }
  } else if (indicator === 'RSI') {
    const indicatorId = `RSI_${period || 14}`
    seriesIds.push(indicatorId)
    formulas.push(`${indicatorId} = rsi(${symbol}, ${period || 14})`)
    seriesMetadata[indicatorId] = {
      name: `RSI (${period || 14})`,
      frequency: 'Daily',
      units: 'Index'
    }
  } else if (indicator === 'MACD') {
    const macdId = 'MACD'
    const signalId = 'MACD_Signal'
    seriesIds.push(macdId, signalId)
    formulas.push(`${macdId} = macd(${symbol})`)
    formulas.push(`${signalId} = macd_signal(${symbol})`)
    seriesMetadata[macdId] = {
      name: 'MACD Line',
      frequency: 'Daily',
      units: 'Index'
    }
    seriesMetadata[signalId] = {
      name: 'Signal Line',
      frequency: 'Daily',
      units: 'Index'
    }
  } else if (indicator === 'BBANDS') {
    const upperId = 'BB_Upper'
    const middleId = 'BB_Middle'
    const lowerId = 'BB_Lower'
    seriesIds.push(upperId, middleId, lowerId)
    formulas.push(`${upperId} = bbands_upper(${symbol}, ${period || 20})`)
    formulas.push(`${middleId} = bbands_middle(${symbol}, ${period || 20})`)
    formulas.push(`${lowerId} = bbands_lower(${symbol}, ${period || 20})`)
    seriesMetadata[upperId] = {
      name: 'Upper Band',
      frequency: 'Daily',
      units: 'USD'
    }
    seriesMetadata[middleId] = {
      name: 'Middle Band',
      frequency: 'Daily',
      units: 'USD'
    }
    seriesMetadata[lowerId] = {
      name: 'Lower Band',
      frequency: 'Daily',
      units: 'USD'
    }
  }

  return saveChartToDashboard({
    chartName: `${symbol} - ${indicator}${period ? ` (${period})` : ''}`,
    symbols: [symbol],
    formulas,
    seriesIds,
    seriesMetadata
  })
}

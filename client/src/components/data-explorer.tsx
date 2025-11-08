import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FolderOpen, Download, TrendingUp, Database, ChevronRight, LineChart, Table, BarChart3, FileSpreadsheet, Plus, Save } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SearchResult {
  source: string
  code: string
  name: string
  frequency?: string
  popularity?: number
  type?: string
  region?: string
  match_score?: number
}

interface Category {
  id: number
  name: string
  parent_id: number
}

interface Series {
  id: string
  name: string
  frequency: string
  last_updated: string
  popularity: number
  units: string
}

interface SeriesData {
  date: string
  value: number
}

interface SeriesStats {
  current: number
  min: number
  max: number
  avg: number
  trend: number
}

async function searchData(query: string) {
  const res = await fetch(`/api/search/?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Failed to search')
  return res.json()
}

async function fetchCategories(parentId: number = 0) {
  const res = await fetch(`/api/fred/categories/?parent=${parentId}`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

async function fetchCategorySeries(categoryId: number) {
  const res = await fetch(`/api/fred/categories/${categoryId}/series/`)
  if (!res.ok) throw new Error('Failed to fetch series')
  return res.json()
}

async function fetchSeriesData(seriesId: string) {
  const res = await fetch(`/api/economic-data/${seriesId}/`)
  if (!res.ok) throw new Error('Failed to fetch series data')
  return res.json()
}

async function exportSeries(seriesIds: string[]) {
  const res = await fetch('/api/export/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ series_ids: seriesIds })
  })
  if (!res.ok) throw new Error('Failed to export')
  return res.json()
}

function calculateStats(data: SeriesData[]): SeriesStats {
  if (!data || data.length === 0) {
    return { current: 0, min: 0, max: 0, avg: 0, trend: 0 }
  }

  const values = data.map(d => d.value).filter(v => v !== null && !isNaN(v))
  const current = values[values.length - 1] || 0
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  // Calculate trend (% change from first to last)
  const first = values[0]
  const trend = first !== 0 ? ((current - first) / first) * 100 : 0

  return { current, min, max, avg, trend }
}

function convertToCSV(data: any): string {
  if (!data || !data.series) return ''

  let csv = 'Series ID,Date,Value\n'

  Object.entries(data.series).forEach(([seriesId, seriesData]: [string, any]) => {
    seriesData.data.forEach((point: any) => {
      csv += `${seriesId},${point.date},${point.value}\n`
    })
  })

  return csv
}

export default function DataExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number>(0)
  const [categoryPath, setCategoryPath] = useState<Array<{id: number, name: string}>>([])
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set())
  const [showSeriesList, setShowSeriesList] = useState(false)

  // Preview modal states
  const [previewSeriesId, setPreviewSeriesId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'chart' | 'table' | 'stats'>('chart')

  // Save chart dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [chartName, setChartName] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', activeSearch],
    queryFn: () => searchData(activeSearch),
    enabled: activeSearch.length >= 2,
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', selectedCategory],
    queryFn: () => fetchCategories(selectedCategory),
  })

  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ['category-series', selectedCategory],
    queryFn: () => fetchCategorySeries(selectedCategory),
    enabled: showSeriesList && selectedCategory > 0,
  })

  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ['series-preview', previewSeriesId],
    queryFn: () => fetchSeriesData(previewSeriesId!),
    enabled: !!previewSeriesId && showPreview,
  })

  const handleSearch = () => {
    if (searchQuery.length >= 2) {
      setActiveSearch(searchQuery)
    }
  }

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category.id)
    setCategoryPath([...categoryPath, { id: category.id, name: category.name }])
    setShowSeriesList(false)
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setSelectedCategory(0)
      setCategoryPath([])
      setShowSeriesList(false)
    } else {
      const newPath = categoryPath.slice(0, index + 1)
      setSelectedCategory(newPath[index].id)
      setCategoryPath(newPath)
      setShowSeriesList(false)
    }
  }

  const handleViewSeries = () => {
    setShowSeriesList(true)
  }

  const toggleSeriesSelection = (seriesId: string) => {
    const newSelected = new Set(selectedSeries)
    if (newSelected.has(seriesId)) {
      newSelected.delete(seriesId)
    } else {
      newSelected.add(seriesId)
    }
    setSelectedSeries(newSelected)
  }

  const handlePreview = (seriesId: string) => {
    setPreviewSeriesId(seriesId)
    setShowPreview(true)
    setPreviewMode('chart')
  }

  const handleExportJSON = async () => {
    if (selectedSeries.size === 0) return

    try {
      const result = await exportSeries(Array.from(selectedSeries))

      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fred-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert(`Successfully exported ${selectedSeries.size} series as JSON!`)
    } catch (error) {
      alert('Export failed: ' + error)
    }
  }

  const handleExportCSV = async () => {
    if (selectedSeries.size === 0) return

    try {
      const result = await exportSeries(Array.from(selectedSeries))
      const csv = convertToCSV(result.data)

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fred-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert(`Successfully exported ${selectedSeries.size} series as CSV!`)
    } catch (error) {
      alert('Export failed: ' + error)
    }
  }

  const handleSaveToDisplay = async () => {
    if (!chartName.trim()) {
      alert('Please enter a chart name')
      return
    }

    if (selectedSeries.size < 2) {
      alert('Please select at least 2 series to create a chart')
      return
    }

    setSaving(true)
    try {
      const seriesIds = Array.from(selectedSeries)
      const seriesMetadata: Record<string, any> = {}

      // Collect metadata for each selected series
      seriesIds.forEach(id => {
        // Find series in current data
        const series = seriesData?.data?.series?.find((s: any) => s.id === id)
        if (series) {
          seriesMetadata[id] = {
            name: series.name,
            frequency: series.frequency,
            units: series.units
          }
        }
      })

      const API_BASE = import.meta.env.VITE_API_BASE_URL

      const res = await fetch(`${API_BASE}/api/charts/`, {
        method: 'POST',
        credentials: 'include', // Include cookies for session
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart_name: chartName,
          series_ids: seriesIds,
          series_metadata: seriesMetadata
        })
      })

      if (!res.ok) throw new Error('Failed to save chart')

      const result = await res.json()
      alert(`Chart "${chartName}" saved successfully! Go to "Manage Display" tab to view it.`)
      setShowSaveDialog(false)
      setChartName('')
    } catch (error) {
      console.error('Error saving chart:', error)
      alert('Failed to save chart. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleStockClick = (symbol: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-stock', { detail: symbol }))
  }

  // Calculate stats for preview
  const stats = previewData?.data?.historical
    ? calculateStats(previewData.data.historical)
    : null

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="w-8 h-8" />
          Data Explorer
        </h1>
        <p className="text-zinc-400 mt-2">
          Search, browse, and export economic indicators and financial data
        </p>
      </div>

      {/* Universal Search */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search for economic indicators, stocks, or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <Button onClick={handleSearch} disabled={searchQuery.length < 2}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {searchLoading && (
          <div className="text-center py-4 text-zinc-400">Searching...</div>
        )}

        {searchResults?.data && (
          <div className="space-y-4">
            <div className="text-sm text-zinc-400">
              Found {searchResults.data.total} results for "{searchResults.data.query}"
            </div>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="fred">
                  FRED ({searchResults.data.results.filter((r: SearchResult) => r.source === 'FRED').length})
                </TabsTrigger>
                <TabsTrigger value="stocks">
                  Stocks ({searchResults.data.results.filter((r: SearchResult) => r.source === 'Alpha Vantage').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-2 mt-4">
                {searchResults.data.results.map((result: SearchResult, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={result.source === 'FRED' ? 'default' : 'secondary'}>
                            {result.source}
                          </Badge>
                          <span className="font-mono text-sm text-zinc-300">{result.code}</span>
                          {result.popularity && result.popularity > 70 && (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="font-medium mb-2">{result.name}</div>
                        <div className="flex gap-2">
                          {result.source === 'FRED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreview(result.code)}
                            >
                              <LineChart className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                          )}
                          {result.source === 'Alpha Vantage' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockClick(result.code)}
                            >
                              View Stock
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="fred" className="space-y-2 mt-4">
                {searchResults.data.results
                  .filter((r: SearchResult) => r.source === 'FRED')
                  .map((result: SearchResult, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-zinc-300">{result.code}</span>
                      </div>
                      <div className="font-medium mb-2">{result.name}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(result.code)}
                      >
                        <LineChart className="w-3 h-3 mr-1" />
                        Preview Data
                      </Button>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="stocks" className="space-y-2 mt-4">
                {searchResults.data.results
                  .filter((r: SearchResult) => r.source === 'Alpha Vantage')
                  .map((result: SearchResult, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      onClick={() => handleStockClick(result.code)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-blue-400">{result.code}</span>
                      </div>
                      <div className="font-medium">{result.name}</div>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>

      {/* Category Browser */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Browse FRED Categories
          </h2>
          {selectedCategory > 0 && !showSeriesList && (
            <Button onClick={handleViewSeries} variant="outline" size="sm">
              View Series in This Category
            </Button>
          )}
        </div>

        {/* Breadcrumb */}
        {categoryPath.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-sm text-zinc-400 flex-wrap">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="hover:text-zinc-200"
            >
              Root
            </button>
            {categoryPath.map((cat, idx) => (
              <div key={cat.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className="hover:text-zinc-200"
                >
                  {cat.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {categoriesLoading && (
          <div className="text-center py-8 text-zinc-400">Loading categories...</div>
        )}

        {!showSeriesList && categoriesData?.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesData.data.categories.map((category: Category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </div>
            ))}
          </div>
        )}

        {/* Series List */}
        {showSeriesList && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                {seriesData?.data?.total || 0} series found
              </div>
              {selectedSeries.size > 0 && (
                <div className="flex gap-2">
                  {selectedSeries.size >= 2 && (
                    <Button
                      onClick={() => setShowSaveDialog(true)}
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Display ({selectedSeries.size})
                    </Button>
                  )}
                  <Button onClick={handleExportJSON} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    JSON ({selectedSeries.size})
                  </Button>
                  <Button onClick={handleExportCSV} size="sm" variant="outline">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    CSV ({selectedSeries.size})
                  </Button>
                </div>
              )}
            </div>

            {seriesLoading && (
              <div className="text-center py-8 text-zinc-400">Loading series...</div>
            )}

            {seriesData?.data && (
              <div className="space-y-2">
                {seriesData.data.series.map((series: Series) => (
                  <div
                    key={series.id}
                    className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedSeries.has(series.id)}
                        onChange={() => toggleSeriesSelection(series.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-blue-400">{series.id}</span>
                          {series.popularity > 70 && (
                            <Badge variant="default">Popular</Badge>
                          )}
                        </div>
                        <div className="font-medium mb-2">{series.name}</div>
                        <div className="flex gap-2 mb-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(series.id)}
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                        <div className="flex gap-4 text-xs text-zinc-500">
                          <span>Frequency: {series.frequency}</span>
                          <span>Units: {series.units}</span>
                          <span>Updated: {series.last_updated}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewData?.data?.series_id || 'Loading...'}
              <Badge variant="outline">{previewData?.data?.description}</Badge>
            </DialogTitle>
            <DialogDescription>
              {previewData?.data?.last_updated && `Last updated: ${previewData.data.last_updated}`}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="chart">
                <LineChart className="w-4 h-4 mr-2" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="stats">
                <TrendingUp className="w-4 h-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="table">
                <Table className="w-4 h-4 mr-2" />
                Data Table
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-4">
              {previewLoading && (
                <div className="h-64 flex items-center justify-center text-zinc-400">
                  Loading chart data...
                </div>
              )}
              {previewData?.data?.historical && (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLine data={previewData.data.historical}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name={previewData.data.description}
                    />
                  </RechartsLine>
                </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-zinc-800/50 border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-1">Current Value</div>
                    <div className="text-2xl font-bold">{stats.current.toLocaleString()}</div>
                  </Card>
                  <Card className="p-4 bg-zinc-800/50 border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-1">Average</div>
                    <div className="text-2xl font-bold">{stats.avg.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                  </Card>
                  <Card className="p-4 bg-zinc-800/50 border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-1">Trend</div>
                    <div className={`text-2xl font-bold ${stats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(2)}%
                    </div>
                  </Card>
                  <Card className="p-4 bg-zinc-800/50 border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-1">Minimum</div>
                    <div className="text-2xl font-bold">{stats.min.toLocaleString()}</div>
                  </Card>
                  <Card className="p-4 bg-zinc-800/50 border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-1">Maximum</div>
                    <div className="text-2xl font-bold">{stats.max.toLocaleString()}</div>
                  </Card>
                  <Card className="p-4 bg-zinc-800/50 border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-1">Data Points</div>
                    <div className="text-2xl font-bold">{previewData?.data?.historical?.length || 0}</div>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="table" className="mt-4">
              {previewData?.data?.historical && (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-700">
                      <tr>
                        <th className="text-left p-2">Date</th>
                        <th className="text-right p-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.historical.slice().reverse().map((point: SeriesData, idx: number) => (
                        <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                          <td className="p-2">{point.date}</td>
                          <td className="p-2 text-right font-mono">{point.value.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Save Chart Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Chart to Display</DialogTitle>
            <DialogDescription>
              Create a multi-series chart from the {selectedSeries.size} selected series
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Chart Name</label>
              <Input
                placeholder="e.g., GDP vs Unemployment"
                value={chartName}
                onChange={(e) => setChartName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveToDisplay()}
              />
            </div>

            <div className="text-sm text-zinc-400">
              Selected series ({selectedSeries.size}):
              <ul className="mt-2 space-y-1">
                {Array.from(selectedSeries).slice(0, 5).map(id => (
                  <li key={id} className="text-zinc-300">• {id}</li>
                ))}
                {selectedSeries.size > 5 && (
                  <li className="text-zinc-500">• ... and {selectedSeries.size - 5} more</li>
                )}
              </ul>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false)
                setChartName('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveToDisplay}
              disabled={saving || !chartName.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Chart'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

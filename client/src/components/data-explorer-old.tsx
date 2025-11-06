import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FolderOpen, Download, TrendingUp, Database, ChevronRight } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

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

async function exportSeries(seriesIds: string[]) {
  const res = await fetch('/api/export/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ series_ids: seriesIds })
  })
  if (!res.ok) throw new Error('Failed to export')
  return res.json()
}

export default function DataExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number>(0)
  const [categoryPath, setCategoryPath] = useState<Array<{id: number, name: string}>>([])
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set())
  const [showSeriesList, setShowSeriesList] = useState(false)

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

  const handleExport = async () => {
    if (selectedSeries.size === 0) return

    try {
      const result = await exportSeries(Array.from(selectedSeries))

      // Download the JSON file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fred-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert(`Successfully exported ${selectedSeries.size} series!`)
    } catch (error) {
      alert('Export failed: ' + error)
    }
  }

  const handleStockClick = (symbol: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-stock', { detail: symbol }))
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="w-8 h-8" />
          Data Explorer
        </h1>
        <p className="text-zinc-400 mt-2">
          Search and explore economic indicators and financial data from FRED and Alpha Vantage
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
                    className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    onClick={() => result.source === 'Alpha Vantage' && handleStockClick(result.code)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={result.source === 'FRED' ? 'default' : 'secondary'}>
                            {result.source}
                          </Badge>
                          <span className="font-mono text-sm text-zinc-300">{result.code}</span>
                          {result.popularity && (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="font-medium">{result.name}</div>
                        <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                          {result.frequency && <span>Frequency: {result.frequency}</span>}
                          {result.type && <span>Type: {result.type}</span>}
                          {result.region && <span>Region: {result.region}</span>}
                        </div>
                      </div>
                      {result.match_score && (
                        <div className="text-sm text-zinc-400">
                          Match: {(result.match_score * 100).toFixed(0)}%
                        </div>
                      )}
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
                        {result.popularity && result.popularity > 50 && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="font-medium">{result.name}</div>
                      <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                        {result.frequency && <span>Frequency: {result.frequency}</span>}
                        {result.popularity && <span>Popularity: {result.popularity}</span>}
                      </div>
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
                      <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                        {result.type && <span>{result.type}</span>}
                        {result.region && <span>{result.region}</span>}
                      </div>
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
                <Button onClick={handleExport} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export {selectedSeries.size} Selected
                </Button>
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
                        <div className="flex gap-4 text-xs text-zinc-500">
                          <span>Frequency: {series.frequency}</span>
                          <span>Units: {series.units}</span>
                          <span>Updated: {series.last_updated}</span>
                          <span>Popularity: {series.popularity}</span>
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
    </div>
  )
}

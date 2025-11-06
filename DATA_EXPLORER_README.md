# Data Explorer Feature - Integration Complete!

## 🎉 What's New

The MacroDash application now includes a powerful **Data Explorer** that allows users to search, browse, and export economic data from FRED and stock market data from Alpha Vantage in one unified interface.

---

## ✨ Features Implemented

### 1. **Universal Search** 🔍
- **Combined Search**: Search across both FRED economic indicators AND Alpha Vantage stock symbols simultaneously
- **Smart Results**: Results are categorized by source (FRED vs Stocks) with relevant metadata
- **Click-to-Navigate**: Click on stock results to view detailed stock information

### 2. **FRED Category Browser** 📁
- **Hierarchical Navigation**: Browse through FRED's category tree structure
- **Breadcrumb Navigation**: Easy navigation back through category levels
- **Series Discovery**: View all time series within any category
- **Smart Sorting**: Series are automatically sorted by popularity

### 3. **Data Export** 💾
- **Multi-Select**: Check multiple FRED series for bulk export
- **JSON Export**: Export selected series with full historical data and metadata
- **One-Click Download**: Automatically downloads a formatted JSON file
- **Complete Metadata**: Includes frequency, units, observation dates, and more

### 4. **Enhanced UI/UX** 🎨
- **Tabbed Interface**: Switch between "All Results", "FRED", and "Stocks" views
- **Popularity Indicators**: Visual badges for popular/trending series
- **Real-time Loading States**: Professional loading indicators
- **Responsive Design**: Works seamlessly on desktop and mobile

---

## 🚀 How to Use

### Starting the Application

1. **Start Backend Server**:
   ```bash
   cd server
   source macrodash_env/bin/activate  # or venv/Scripts/activate on Windows
   python manage.py runserver
   ```

2. **Start Frontend Dev Server**:
   ```bash
   cd client
   yarn dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Using Data Explorer

#### Method 1: Universal Search
1. Click "Data Explorer" in the sidebar
2. Type your search query (e.g., "unemployment", "AAPL", "inflation")
3. Press Enter or click Search
4. Browse results in the tabbed interface:
   - **All Results**: Combined view
   - **FRED**: Economic indicators only
   - **Stocks**: Stock symbols only
5. Click on any stock result to view detailed stock information

#### Method 2: Category Browser
1. Navigate to "Data Explorer"
2. Scroll to "Browse FRED Categories" section
3. Click on any category to drill down
4. Use breadcrumbs to navigate back
5. Click "View Series in This Category" to see available data series
6. Check boxes next to series you want to export
7. Click "Export X Selected" to download as JSON

---

## 📡 API Endpoints

### New Endpoints Added

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search/?q=<query>` | GET | Universal search across FRED and Alpha Vantage |
| `/api/fred/categories/` | GET | Get root FRED categories |
| `/api/fred/categories/?parent=<id>` | GET | Get child categories of parent |
| `/api/fred/categories/<id>/series/` | GET | Get all series in a category |
| `/api/fred/series/<id>/metadata/` | GET | Get detailed metadata for a series |
| `/api/export/` | POST | Export multiple series to JSON |

### Example API Calls

**Search for "GDP"**:
```bash
curl "http://localhost:8000/api/search/?q=GDP"
```

**Get Root Categories**:
```bash
curl "http://localhost:8000/api/fred/categories/"
```

**Get Series in Category 32991**:
```bash
curl "http://localhost:8000/api/fred/categories/32991/series/"
```

**Export Multiple Series**:
```bash
curl -X POST http://localhost:8000/api/export/ \
  -H "Content-Type: application/json" \
  -d '{"series_ids": ["GDP", "UNRATE", "CPIAUCSL"]}'
```

---

## 🔧 Technical Implementation

### Backend Changes

#### 1. **Enhanced FREDService** (`server/api/services.py`)
New methods added:
- `search_combined(query)` - Universal search
- `get_fred_categories(parent_id)` - Browse categories
- `get_series_in_category(category_id)` - List series
- `get_series_metadata(series_id)` - Get metadata
- `export_multiple_series(series_ids)` - Export to JSON

#### 2. **New Views** (`server/api/views.py`)
- `search_data` - Handle universal search requests
- `fred_categories` - Return category tree
- `fred_category_series` - Return series in category
- `fred_series_metadata` - Return series metadata
- `export_data` - Handle export requests

#### 3. **URL Routing** (`server/api/urls.py`)
All new endpoints properly routed

### Frontend Changes

#### 1. **New Component** (`client/src/components/data-explorer.tsx`)
- Complete Data Explorer interface
- Integrates search, browse, and export functionality
- React Query for data fetching
- Professional UI with loading states

#### 2. **App Integration** (`client/src/App.tsx`)
- Added DataExplorer component to routing
- Integrated with existing navigation system

#### 3. **Sidebar Update** (`client/src/components/app-sidebar.tsx`)
- Added "Data Explorer" menu item
- Proper navigation handling

---

## 📊 Data Export Format

Exported JSON structure:
```json
{
  "export_date": "2025-01-03T12:00:00",
  "series_count": 3,
  "series": {
    "GDP": {
      "metadata": {
        "id": "GDP",
        "name": "Gross Domestic Product",
        "frequency": "Quarterly",
        "units": "Billions of Dollars",
        "last_updated": "2024-12-20"
      },
      "data": [
        {
          "date": "2020-01-01",
          "value": 21747.394
        },
        ...
      ]
    },
    ...
  }
}
```

---

## 🎯 Use Cases

### For Economists & Researchers
- Quickly find and export multiple related economic indicators
- Compare different data series
- Build custom datasets for analysis

### For Investors & Traders
- Search for specific stocks and economic indicators
- Discover relationships between economic data and market performance
- Export data for custom analysis tools

### For Data Scientists
- Bulk export of time series data
- Easy access to metadata for automated analysis
- Standardized JSON format for easy parsing

---

## 🔐 API Keys Required

Ensure these environment variables are set in `server/.env`:

```env
FRED_API_KEY=your_fred_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

Get your free API keys:
- **FRED**: https://fred.stlouisfed.org/docs/api/api_key.html
- **Alpha Vantage**: https://www.alphavantage.co/support/#api-key

---

## ⚡ Performance Features

1. **Rate Limiting**: Automatic 0.5s delays between API calls to respect rate limits
2. **Caching**: React Query caches search results for 30 seconds
3. **Lazy Loading**: Category data loaded only when needed
4. **Error Handling**: Graceful fallbacks if API keys are missing

---

## 🐛 Troubleshooting

### Search Not Working
- Verify FRED_API_KEY and ALPHA_VANTAGE_API_KEY are set in `.env`
- Check browser console for errors
- Ensure backend server is running

### Categories Not Loading
- Check FRED API key is valid
- Verify network connection
- Look for rate limit errors in backend logs

### Export Not Downloading
- Check browser popup blocker settings
- Verify at least one series is selected
- Check backend logs for export errors

---

## 🚀 Future Enhancements

Potential features for Sprint 6+:
- **CSV Export**: Add CSV export option alongside JSON
- **Date Range Selection**: Filter exported data by date range
- **Saved Searches**: Save frequently used search queries
- **Watchlists**: Create custom lists of favorite series
- **Charts**: Preview data with quick charts before export
- **Batch Operations**: Process multiple exports simultaneously
- **Advanced Filters**: Filter by frequency, popularity, etc.

---

## 📝 Code Quality

- ✅ TypeScript for type safety
- ✅ Error handling on all API calls
- ✅ Loading states for better UX
- ✅ Responsive design
- ✅ Accessible UI components
- ✅ Rate limiting to respect API limits
- ✅ Proper separation of concerns

---

## 📚 Related Documentation

- [FRED API Documentation](https://fred.stlouisfed.org/docs/api/fred/)
- [Alpha Vantage API Documentation](https://www.alphavantage.co/documentation/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🙏 Credits

Implemented by Claude Code for MacroDash
- **Course**: CS-GY 6063 Software Engineering Fall 2025
- **Team**: Section 3 Group 6
- **Integration Date**: January 2025

---

## ✅ Testing Checklist

Before deployment, test:

- [ ] Universal search with various queries
- [ ] Category navigation (drill down and back)
- [ ] View series in different categories
- [ ] Select and deselect series
- [ ] Export single series
- [ ] Export multiple series
- [ ] Download and verify JSON format
- [ ] Click stock results to navigate
- [ ] Test with missing API keys (should show errors)
- [ ] Test on mobile devices
- [ ] Test with slow network connection

---

**Happy Exploring! 🎉**

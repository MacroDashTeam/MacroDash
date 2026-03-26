# Agentic Workflow Implementation Summary

## Overview
Successfully implemented two autonomous agents that run every 6 hours to provide portfolio recommendations and news synthesis. Both agents display results on the dashboard and send email reports to opted-in users.

---

## Phase 1: Database Models ✅

### Changes Made
- **File:** `server/api/models.py`
- **Added Models:**

#### `PortfolioRecommendation` Model
- `symbol` - Stock ticker (db_indexed)
- `stock_name` - Company name
- `recommendation` - BUY/SELL/HOLD choice field
- `confidence_score` - 0.0 to 1.0
- `reasoning` - List of reasoning points (JSONField)
- `signals` - Bullish/bearish signals (JSONField)
- `raw_analysis` - Full LLM response text
- `created_at`, `updated_at` timestamps
- Indexes on `(symbol, updated_at)` for fast queries
- Meta: ordered by `-updated_at`, latest entry via `get_latest_by`

#### `NewsSynthesis` Model
- `symbol` - Stock ticker (db_indexed)
- `stock_name` - Company name
- `impact_score` - -1.0 to 1.0 impact rating
- `summary` - 2-3 sentence synthesis
- `key_developments` - List of major developments (JSONField)
- `entities_mentioned` - Companies/people mentioned (JSONField)
- `articles_analyzed` - Count of articles processed
- `created_at`, `updated_at` timestamps
- Indexes on `(symbol, updated_at)` for fast queries

#### `UserPreferences` Update
- Added `agent_notifications` boolean field (default: False)
- Users must opt-in to receive agent email reports

### Migration
- Run: `python manage.py makemigrations && python manage.py migrate`
- Creates tables for agent models with proper indexing

---

## Phase 2: Service Layer ✅

### Changes Made
- **File:** `server/api/services.py`
- **Added Methods to `OpenAIService` class:**

#### `run_portfolio_agent(symbols: List[tuple]) -> List[Dict]`
Analyzes popular stocks and generates BUY/SELL/HOLD recommendations:

1. **Data Collection** (for each symbol):
   - Stock details via YahooFinanceService
   - Technical indicators via TechnicalIndicatorService
   - News sentiment via AlphaVantageService

2. **Analysis Prompt**:
   - Sends comprehensive context to GPT-4o-mini
   - Requests: RECOMMENDATION, CONFIDENCE, REASONING, BULLISH/BEARISH_SIGNALS

3. **Response Parsing**:
   - Extracts recommendation (BUY/SELL/HOLD)
   - Confidence score (0.0-1.0)
   - Reasoning bullets
   - Bullish and bearish signal lists

4. **Database Upsert**:
   - Updates or creates `PortfolioRecommendation` record
   - Returns array of recommendation dicts for email

#### `run_news_synthesis_agent(symbols: List[tuple]) -> List[Dict]`
Synthesizes news articles and generates impact analysis:

1. **News Fetching** (for each symbol):
   - Fetches top 10 articles via AlphaVantageService
   - Includes sentiment labels from Alpha Vantage

2. **Synthesis Prompt**:
   - Sends article summaries to GPT-4o-mini
   - Requests: IMPACT_SCORE, SUMMARY, KEY_DEVELOPMENTS, ENTITIES

3. **Response Parsing**:
   - Extracts impact score (-1.0 to 1.0)
   - Extracts summary text
   - Extracts key developments list
   - Extracts mentioned entities

4. **Database Upsert**:
   - Updates or creates `NewsSynthesis` record
   - Returns array of synthesis dicts for email

#### `send_agent_report_email()` Function
**Location:** `server/api/scheduler.py`

- Queries all opted-in users (`agent_notifications=True`)
- Builds email subject: "📊 MacroDash Agent Report — X BUY, Y HOLD, Z SELL"
- Constructs message with:
  - Portfolio recommendations (top 10 with confidence)
  - News syntheses (top 10 with impact scores)
  - Report timestamp
- Sends via Django `send_mail()` with `fail_silently=True`
- Logs success/failure per user

---

## Phase 3: API Endpoints ✅

### Changes Made
- **File:** `server/api/views.py` - Added 3 endpoints
- **File:** `server/api/urls.py` - Registered routes

#### Endpoints

##### `GET /api/agent/portfolio/`
**Portfolio Recommendations**
- Returns latest recommendation per symbol (updated in last 24h)
- Response:
  ```json
  {
    "status": "success",
    "recommendations": [
      {
        "symbol": "AAPL",
        "stock_name": "Apple Inc.",
        "recommendation": "BUY",
        "confidence_score": 0.85,
        "reasoning": ["Strong Q4 growth", "Analyst upgrades"],
        "signals": {
          "bullish": ["Revenue growth +15%", "PE below average"],
          "bearish": ["Competition increasing"]
        },
        "updated_at": "2026-02-09T10:30:00Z"
      }
    ],
    "count": 10,
    "timestamp": "2026-02-09T10:35:00Z"
  }
  ```

##### `GET /api/agent/news-synthesis/`
**News Synthesis**
- Returns latest news synthesis per symbol (updated in last 24h)
- Response:
  ```json
  {
    "status": "success",
    "syntheses": [
      {
        "symbol": "AAPL",
        "stock_name": "Apple Inc.",
        "impact_score": 0.65,
        "summary": "Recent earnings beat expectations with strong iPhone sales.",
        "key_developments": ["Q4 earnings beat", "iPhone 16 launch"],
        "entities_mentioned": ["TSMC", "suppliers"],
        "articles_analyzed": 8,
        "updated_at": "2026-02-09T10:30:00Z"
      }
    ],
    "count": 10,
    "timestamp": "2026-02-09T10:35:00Z"
  }
  ```

##### `GET/PATCH /api/preferences/`
**User Preferences** (requires authentication)

- GET: Returns user's notification preferences
- PATCH: Updates preferences (agent_notifications, email_alerts, etc.)
- Response:
  ```json
  {
    "status": "success",
    "data": {
      "theme": "dark",
      "default_time_period": "1M",
      "email_alerts": true,
      "price_alert_notifications": true,
      "news_notifications": false,
      "agent_notifications": true,
      "preferred_news_source": "alpha_vantage"
    }
  }
  ```

---

## Phase 4: Scheduler Jobs ✅

### Changes Made
- **File:** `server/api/scheduler.py`
- **Added Functions:**

#### `run_portfolio_agent()`
- Calls `OpenAIService.run_portfolio_agent()` with 10 popular stocks
- Logs recommendations generated
- Sends email reports to opted-in users
- Scheduled: Every 6 hours via APScheduler

#### `run_news_synthesis_agent()`
- Calls `OpenAIService.run_news_synthesis_agent()` with 10 popular stocks
- Logs syntheses generated
- Sends email reports to opted-in users
- Scheduled: Every 6 hours via APScheduler

#### Agent Stocks (Both Jobs)
```python
[
  ('AAPL', 'Apple Inc.'),
  ('MSFT', 'Microsoft Corporation'),
  ('GOOGL', 'Alphabet Inc.'),
  ('AMZN', 'Amazon.com Inc.'),
  ('NVDA', 'NVIDIA Corporation'),
  ('TSLA', 'Tesla Inc.'),
  ('META', 'Meta Platforms Inc.'),
  ('JPM', 'JPMorgan Chase & Co.'),
  ('V', 'Visa Inc.'),
  ('WMT', 'Walmart Inc.'),
]
```

#### Job Registration
Both jobs registered in `start_scheduler()`:
```python
scheduler.add_job(
  run_portfolio_agent,
  'interval',
  hours=6,
  id='run_portfolio_agent',
  name='Autonomous Portfolio Agent',
  replace_existing=True,
)

scheduler.add_job(
  run_news_synthesis_agent,
  'interval',
  hours=6,
  id='run_news_synthesis_agent',
  name='News Synthesis Agent',
  replace_existing=True,
)
```

---

## Phase 5: Frontend Components ✅

### New Components Created

#### `client/src/components/agent-recommendations-panel.tsx` (~100 lines)
Displays portfolio recommendations with collapsible details:

**Features:**
- Fetches from `GET /api/agent/portfolio/` (refetch every 6 hours)
- Stock cards with:
  - Symbol and company name
  - BUY/SELL/HOLD badge (color-coded)
  - Confidence score bar (0-100%)
  - Collapsible details showing:
    - Full reasoning bullets
    - Bullish signals (top 2)
    - Bearish signals (top 2)
    - Last analyzed timestamp
- Loading skeleton while fetching
- Empty state message
- Error handling

**Styling:**
- Uses shadcn Card, Badge, Skeleton components
- Dark theme compatible
- Hover effects and transitions
- Responsive grid layout

#### `client/src/components/news-synthesis-panel.tsx` (~120 lines)
Displays news synthesis with impact meters:

**Features:**
- Fetches from `GET /api/agent/news-synthesis/` (refetch every 6 hours)
- Stock cards with:
  - Symbol and company name
  - Impact score meter (-1.0 to +1.0 gradient)
  - Summary preview (2 lines)
  - Collapsible details showing:
    - Full summary
    - Key developments (top 3)
    - Entities mentioned (as chips/badges, top 5)
    - Article count and timestamp
- Color-coded impact: Red (negative) → Yellow (neutral) → Green (positive)
- Loading skeleton while fetching
- Empty state message
- Error handling

**Styling:**
- Uses shadcn Card, Badge, Skeleton components
- Gradient impact meter with visual indicator
- Dark theme compatible
- Responsive layout

### Modified Components

#### `client/src/components/dashboard-home.tsx`
**Changes:**
- Added imports for new components
- Added two new sections after Watchlist:
  ```tsx
  {/* Agent Recommendations */}
  <section>
    <AgentRecommendationsPanel />
  </section>

  {/* News Synthesis */}
  <section>
    <NewsSynthesisPanel />
  </section>
  ```

#### `client/src/components/settings.tsx`
**Changes:**
- Added Checkbox import and React Query hooks
- Added state management for preferences fetching/updating
- Added Notifications card section (before Important Notice) with:
  - **AI Agent Reports** toggle (main feature)
  - Email Alerts toggle
  - Price Alert Notifications toggle
  - News Notifications toggle
- Each toggle updates via `PATCH /api/preferences/`
- Loading state while fetching preferences
- Disabled state while updating

**UI Features:**
- Bell icon in card header
- Checkboxes instead of switches (shadcn/ui compatible)
- Description text for each notification type
- Disabled state during mutation

---

## Data Flow Architecture

```
APScheduler (every 6h)
    ↓
run_portfolio_agent() ──→ OpenAIService.run_portfolio_agent()
    │                     ├─ Fetch stock/tech/news data
    │                     ├─ Call GPT-4o-mini
    │                     └─ Upsert PortfolioRecommendation
    │
    ├─→ send_agent_report_email()
    │     └─ Query opted-in users → send emails
    │
run_news_synthesis_agent() → OpenAIService.run_news_synthesis_agent()
    │                        ├─ Fetch news articles
    │                        ├─ Call GPT-4o-mini
    │                        └─ Upsert NewsSynthesis
    │
    └─→ send_agent_report_email()
         └─ Query opted-in users → send emails

Frontend:
  Dashboard Home
    ├─ AgentRecommendationsPanel
    │  └─ useQuery(/api/agent/portfolio/) → TanStack Query
    │     └─ refetchInterval: 6h
    │
    └─ NewsSynthesisPanel
       └─ useQuery(/api/agent/news-synthesis/) → TanStack Query
          └─ refetchInterval: 6h

  Settings
    └─ Notifications Card
       ├─ useQuery(/api/preferences/) → Fetch user prefs
       └─ useMutation(PATCH /api/preferences/) → Update prefs
```

---

## Files Modified/Created

### Backend
| File | Status | Changes |
|------|--------|---------|
| `server/api/models.py` | ✅ Modified | +2 models, +1 UserPreferences field (~65 lines) |
| `server/api/services.py` | ✅ Modified | +2 methods to OpenAIService (~150 lines) |
| `server/api/views.py` | ✅ Modified | +3 endpoints (~200 lines) |
| `server/api/urls.py` | ✅ Modified | +3 routes (~3 lines) |
| `server/api/scheduler.py` | ✅ Modified | +2 jobs, +email function (~150 lines) |
| `server/api/migrations/XXXX_add_agent_models.py` | 🔄 Auto | Will be generated |

### Frontend
| File | Status | Changes |
|------|--------|---------|
| `client/src/components/agent-recommendations-panel.tsx` | ✅ Created | ~100 lines |
| `client/src/components/news-synthesis-panel.tsx` | ✅ Created | ~120 lines |
| `client/src/components/dashboard-home.tsx` | ✅ Modified | +2 sections (~10 lines) |
| `client/src/components/settings.tsx` | ✅ Modified | +notifications section (~80 lines) |

---

## Deployment Checklist

### Backend
1. ✅ Models created (run migrations before deployment)
2. ✅ Service methods implemented with error handling
3. ✅ API endpoints implemented with proper authentication
4. ✅ Scheduler jobs registered and configured
5. ⚠️ Ensure environment variables set:
   - `OPENAI_API_KEY` (required for agents)
   - `ALPHA_VANTAGE_API_KEY` (optional, for news data)
   - `PERPLEXITY_API_KEY` (optional, for market insights)

### Frontend
1. ✅ Components created and integrated
2. ✅ API calls use correct endpoints
3. ✅ Query keys are consistent
4. ✅ Error handling implemented
5. ✅ Loading states implemented
6. ✅ Empty states implemented

### Database Migrations
```bash
cd server
python manage.py makemigrations  # Creates migration file
python manage.py migrate         # Applies migrations
```

### Testing Recommendations

#### API Endpoints
```bash
# Get recommendations
curl http://localhost:8000/api/agent/portfolio/

# Get news synthesis
curl http://localhost:8000/api/agent/news-synthesis/

# Get preferences (with auth)
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/preferences/

# Update preferences (with auth)
curl -X PATCH http://localhost:8000/api/preferences/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"agent_notifications": true}'
```

#### Scheduler Jobs (Manual Testing)
```python
# Django shell
from api.scheduler import run_portfolio_agent, run_news_synthesis_agent

# Test portfolio agent
recommendations = run_portfolio_agent()
print(f"Generated {len(recommendations)} recommendations")

# Test news synthesis agent
syntheses = run_news_synthesis_agent()
print(f"Generated {len(syntheses)} syntheses")
```

#### Email Testing
Enable Django email console output in settings:
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

---

## Future Enhancements

1. **Customizable Stock List**: Let users select which stocks to analyze
2. **Agent Configuration**: Adjust analysis depth, number of stocks, etc.
3. **Recommendation History**: Track how accurate agent recommendations were
4. **Historical Analysis**: Compare agent recommendations to actual price movements
5. **Real-time Alerts**: Push notifications when major signals change
6. **Performance Metrics**: Show agent win rate and accuracy over time
7. **Custom Sectors**: Allow users to follow specific sectors/industries
8. **Integration with Watchlist**: Auto-analyze user's watched stocks

---

## Known Limitations

1. Agent runs every 6 hours - near real-time analysis not available
2. Email reports sent to all opted-in users (no user-specific customization)
3. Recommendations use `gpt-4o-mini` (faster but less sophisticated)
4. 10 stocks analyzed - large watchlists would require agent scaling
5. No historical tracking of recommendation accuracy

---

## Technical Notes

- **API Model**: Upsert pattern ensures no duplicates per symbol
- **Scheduling**: Uses APScheduler with DjangoJobStore for persistence
- **Email Failsafety**: `fail_silently=True` allows agent to continue if email fails
- **Frontend Caching**: 6-hour refetch interval matches agent run frequency
- **Preference Updates**: PATCH endpoint allows selective field updates
- **Database Indexes**: Compound indexes on `(symbol, updated_at)` for fast queries

---

## Summary

✅ **All 5 Phases Complete**
- Database models with proper indexing
- Service layer with AI analysis methods
- API endpoints with authentication
- Scheduler jobs running every 6 hours
- Frontend panels with real-time updates
- Settings UI for user opt-in
- Email notifications to opted-in users

**Total Lines Added**: ~600+ lines across backend and frontend
**Files Modified**: 7
**Files Created**: 2
**New Database Tables**: 2
**New API Endpoints**: 3
**New Scheduler Jobs**: 2

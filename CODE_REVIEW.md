# MacroDash Code Review

Codebase audit as of 2026-03-25. Issues ranked by severity. Use this as a fix checklist.

---

## Strengths (don't break these)

- Modern stack: Vite + React + TypeScript + TanStack Query + shadcn/ui
- Real API integrations: FRED, Yahoo Finance, Alpha Vantage, OpenAI, CoinGecko
- Well-structured data models with proper DB indexes
- `cache_page` on market data endpoints
- Background scheduler (APScheduler) for price alert checks

---

## Issues to Fix

### Critical

#### 1. No backend auth enforcement on most endpoints
- **Files**: `server/api/views.py` (almost every view)
- **Problem**: The login flow exists on the frontend but most API endpoints don't check `request.user.is_authenticated`. Anyone can call `/api/stocks/`, `/api/alerts/`, `/api/watchlist/` etc. without a session. Auth guard lives only in React.
- **Fix**: Add `@login_required` or DRF `permission_classes = [IsAuthenticated]` to protected views.

#### 2. `@csrf_exempt` on almost everything
- **Files**: `server/api/views.py`
- **Problem**: Nearly every view is decorated with `@csrf_exempt`. DRF's `SessionAuthentication` handles CSRF automatically — decorating with `@csrf_exempt` on top either bypasses that protection or is redundant noise. Either way it's wrong.
- **Fix**: Remove `@csrf_exempt` from views that use DRF decorators (`@api_view`). For plain Django views that need CSRF, use DRF properly instead.

#### 3. Health check leaks internal info
- **File**: `server/api/views.py:17-55`
- **Problem**: `/api/health/` is unauthenticated and exposes database engine, table names, API key status, and host. Information disclosure vulnerability in production.
- **Fix**: Restrict to superusers only, or remove sensitive fields from the response.

---

### Architecture

#### 4. Custom event bus anti-pattern in routing
- **File**: `client/src/App.tsx:47-101`
- **Problem**: `StockDetailWrapper`, `CryptoDetailWrapper`, and `IndicatorChartWrapper` all use `window.dispatchEvent(new CustomEvent(...))` with a 50ms `setTimeout` hack to pass route params to child components. The child components could simply call `useParams()` directly. This pattern was bolted on without fixing the root cause.
- **Fix**: Refactor child components (`StockDetail`, `CryptoDetail`, `IndicatorChart`) to accept `symbol`/`indicator` as props or read from `useParams()` directly. Remove the wrapper components and event listeners entirely.

#### 5. `views.py` is a monolith
- **File**: `server/api/views.py` (~18,000 tokens, 40+ endpoints)
- **Problem**: Everything in one file makes it hard to navigate, test, and maintain. Unrelated concerns (stocks, crypto, auth, agents, alerts) are all mixed together.
- **Fix**: Split into focused modules:
  - `stock_views.py`
  - `crypto_views.py`
  - `economic_views.py`
  - `agent_views.py`
  - `auth_views.py`
  - `alert_views.py`

#### 6. Service instantiated on every request
- **File**: `server/api/views.py` (every view function)
- **Problem**: `yahoo_service = YahooFinanceService()` is called inline in every view, paying initialization overhead per request.
- **Fix**: Use module-level singletons or Django's app registry to instantiate services once at startup.

---

### Data Quality

#### 7. Non-deterministic mock sentiment data
- **File**: `server/api/views.py:220-258` (`sentiment_analysis` view)
- **Problem**: Uses `random.choice()` and `random.uniform()` so the same stock returns a different sentiment score on every request. Actively misleading to any user who notices.
- **Fix**: Either implement real sentiment analysis via OpenAI (the service exists) or return a stable stub. Don't use `random` for user-facing data.

#### 8. Dead/fake mock endpoints still in production code
- **File**: `server/api/views.py:113-160` (`stock_news`), `views.py:163-217` (`dashboard_config`)
- **Problem**:
  - `stock_news` returns hardcoded template strings with `https://example.com` URLs.
  - `dashboard_config` GET returns hardcoded JSON; POST echoes back whatever you send without saving to DB — despite `dashboard_layout` existing in `UserPreferences`.
- **Fix**: Wire `stock_news` to Alpha Vantage news endpoint (already exists). Wire `dashboard_config` to `UserPreferences.dashboard_layout`.

#### 9. `print()` used instead of logger
- **File**: `server/api/views.py:387-392`
- **Problem**: `print(f"Error generating insights...")` — won't appear in Django logs, won't have log levels, won't be capturable by log aggregators.
- **Fix**: Use `logger = logging.getLogger(__name__)` and `logger.error(...)`.

---

### Frontend

#### 10. LocalStorage auth is fragile
- **File**: `client/src/App.tsx:173-199`
- **Problem**: User data is loaded from `localStorage` first and shown as "authenticated", then verified async. If the server session has expired, the user appears logged in and API calls fail silently until they manually refresh.
- **Fix**: Show a loading state while the async auth check completes. Only render the app as authenticated once the server confirms the session. Clear localStorage on any 401 response.

#### 11. Dashboard UI disconnected from dashboard model
- **File**: `client/src/components/dashboard-home.tsx`, `server/api/models.py:188`
- **Problem**: `dashboard-home.tsx` is a hardcoded vertical stack of sections. `UserPreferences.dashboard_layout` is a JSONField designed to support custom layouts, but it's never actually used to render the dashboard — the model capability and UI capability are completely disconnected.
- **Fix**: Either implement actual layout customization using `dashboard_layout`, or remove the field from the model to reduce confusion.

---

## Summary Table

| # | Issue | Severity | Area |
|---|-------|----------|------|
| 1 | No backend auth enforcement | Critical | Security |
| 2 | `@csrf_exempt` everywhere | Critical | Security |
| 3 | Health check leaks internals | Critical | Security |
| 4 | Event bus / setTimeout routing hack | High | Architecture |
| 5 | Monolithic `views.py` | High | Architecture |
| 6 | Service instantiated per request | Medium | Performance |
| 7 | Random mock sentiment data | Medium | Data Quality |
| 8 | Dead mock endpoints | Medium | Data Quality |
| 9 | `print()` instead of logging | Low | Observability |
| 10 | Fragile localStorage auth | Medium | Frontend |
| 11 | Dashboard model/UI disconnect | Low | Frontend |

---

## Suggested Fix Order

1. Issues 1, 2, 3 — security before anything else
2. Issue 4 — routing cleanup, high impact on code clarity
3. Issues 7, 8 — data quality, affects user trust
4. Issue 5 — split views.py, makes everything else easier
5. Issues 10, 11 — frontend polish
6. Issues 6, 9 — low-risk cleanup

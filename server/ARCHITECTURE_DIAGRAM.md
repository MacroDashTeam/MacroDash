# 🏗️ MacroDash Testing & Documentation Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MACRODASH API SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │   Swagger    │  │    ReDoc     │  │  React App   │  │  Mobile App  │  │
│   │      UI      │  │              │  │              │  │              │  │
│   │              │  │              │  │              │  │              │  │
│   │   /api/docs/ │  │  /api/redoc/ │  │  Frontend    │  │   Future     │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│          │                  │                  │                  │         │
│          └──────────────────┴──────────────────┴──────────────────┘         │
│                                     │                                       │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API DOCUMENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │              drf-spectacular (OpenAPI 3.0 Generator)                │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │  • Auto-generates OpenAPI schema from decorators                   │  │
│   │  • Provides Swagger UI and ReDoc interfaces                        │  │
│   │  • Validates API contracts                                         │  │
│   │  • Enables API client generation                                   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                     │                                       │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DJANGO REST API LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │   Economic   │  │    Stocks    │  │  Alpha       │  │   Company    │  │
│   │     Data     │  │              │  │  Vantage     │  │     Data     │  │
│   │              │  │              │  │              │  │              │  │
│   │  @extend_    │  │  @extend_    │  │  @extend_    │  │  @extend_    │  │
│   │   schema     │  │   schema     │  │   schema     │  │   schema     │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │    Crypto    │  │  AI Insights │  │  Price       │  │     Auth     │  │
│   │              │  │              │  │  Alerts      │  │              │  │
│   │              │  │              │  │              │  │              │  │
│   │  @extend_    │  │  @extend_    │  │  @extend_    │  │  @extend_    │  │
│   │   schema     │  │   schema     │  │   schema     │  │   schema     │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                             │
│                          60+ API Endpoints                                  │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│   │   FRED     │  │   Yahoo    │  │   Alpha    │  │  OpenAI    │          │
│   │  Service   │  │  Finance   │  │  Vantage   │  │  Service   │          │
│   │            │  │  Service   │  │  Service   │  │            │          │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘          │
│                                                                             │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│   │ CoinMarket │  │ CoinGecko  │  │ Technical  │  │Statsmodels │          │
│   │    Cap     │  │  Service   │  │ Indicator  │  │  Service   │          │
│   │  Service   │  │            │  │  Service   │  │            │          │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘          │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL APIs LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│   │ FRED API   │  │ Yahoo      │  │  Alpha     │  │  OpenAI    │          │
│   │            │  │ Finance    │  │  Vantage   │  │    API     │          │
│   │ Economic   │  │  Stock     │  │  API       │  │            │          │
│   │   Data     │  │   Data     │  │            │  │   GPT-4    │          │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘          │
│                                                                             │
│   ┌────────────┐  ┌────────────┐                                           │
│   │CoinMarket  │  │ CoinGecko  │                                           │
│   │    Cap     │  │    API     │                                           │
│   │   API      │  │            │                                           │
│   │  Crypto    │  │  Crypto    │                                           │
│   └────────────┘  └────────────┘                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


                           ╔══════════════════════════════╗
                           ║     TESTING LAYER (NEW)      ║
                           ╚══════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIT TESTING FRAMEWORK                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    BaseAPITestCase                                  │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │  • Common test fixtures (users, symbols, data)                     │  │
│   │  • Assertion helpers (assertSuccessResponse, etc.)                 │  │
│   │  • Mock data generators for all external services                 │  │
│   │  • Shared test utilities and patterns                             │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                     │                                       │
│            ┌────────────────────────┼────────────────────────┐             │
│            │                        │                        │             │
│            ▼                        ▼                        ▼             │
│   ┌────────────────┐      ┌────────────────┐      ┌────────────────┐     │
│   │  Economic Data │      │     Stocks     │      │ Alpha Vantage  │     │
│   │     Tests      │      │     Tests      │      │     Tests      │     │
│   │                │      │                │      │                │     │
│   │   6 tests      │      │   15 tests     │      │   13 tests     │     │
│   └────────────────┘      └────────────────┘      └────────────────┘     │
│                                                                             │
│   ┌────────────────┐      ┌────────────────┐      ┌────────────────┐     │
│   │    Company     │      │     Crypto     │      │  Auth & Admin  │     │
│   │     Tests      │      │     Tests      │      │     Tests      │     │
│   │                │      │                │      │                │     │
│   │   9 tests      │      │   12 tests     │      │   16 tests     │     │
│   └────────────────┘      └────────────────┘      └────────────────┘     │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Other Endpoints Tests                            │  │
│   │  (Alerts, Charts, Technical Indicators, AI, Data Explorer)          │  │
│   │                         26 tests                                    │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                     TOTAL: 97 COMPREHENSIVE TEST CASES                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


                          ╔═══════════════════════════╗
                          ║   MOCK SERVICES LAYER     ║
                          ╚═══════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOCKED EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│   │ Mock FRED  │  │ Mock Yahoo │  │ Mock Alpha │  │Mock OpenAI │          │
│   │            │  │  Finance   │  │  Vantage   │  │            │          │
│   │  Returns   │  │  Returns   │  │  Returns   │  │  Returns   │          │
│   │  Economic  │  │   Stock    │  │   Quote    │  │   Chat     │          │
│   │   Data     │  │   Data     │  │   Data     │  │ Responses  │          │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘          │
│                                                                             │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐                          │
│   │ Mock CMC   │  │Mock Gecko  │  │Mock Tech   │                          │
│   │            │  │            │  │ Indicators │                          │
│   │  Returns   │  │  Returns   │  │  Returns   │                          │
│   │   Crypto   │  │   Crypto   │  │ Technical  │                          │
│   │   Data     │  │   Data     │  │   Data     │                          │
│   └────────────┘  └────────────┘  └────────────┘                          │
│                                                                             │
│   • No external API calls during testing                                   │
│   • Fast test execution                                                    │
│   • Predictable test results                                               │
│   • No API rate limits or costs                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Test Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TEST EXECUTION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. Developer runs: python manage.py test api.tests
                           │
                           ▼
2. Django Test Runner initializes
   ├─ Creates in-memory test database
   ├─ Runs migrations
   └─ Loads fixtures
                           │
                           ▼
3. Test Discovery
   ├─ Finds all test_*.py files
   ├─ Collects test methods
   └─ Orders test execution
                           │
                           ▼
4. For each test class:
   ├─ setUp() runs (BaseAPITestCase)
   │  ├─ Creates test user
   │  ├─ Sets up test fixtures
   │  └─ Prepares mock services
   │
   ├─ test_method_1() runs
   │  ├─ Arranges test data
   │  ├─ Acts (calls API endpoint)
   │  ├─ Asserts expected results
   │  └─ Validates response
   │
   ├─ test_method_2() runs
   │  └─ ...
   │
   └─ tearDown() runs (cleanup)
                           │
                           ▼
5. Test Results
   ├─ ✅ 97 tests run
   ├─ ⏱️  ~44 seconds execution time
   ├─ 📊 Coverage report generated
   └─ 📝 Test output displayed
                           │
                           ▼
6. Exit Code
   ├─ 0 = All tests passed ✅
   └─ 1 = Some tests failed ❌
```

---

## Documentation Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SWAGGER DOCUMENTATION GENERATION                         │
└─────────────────────────────────────────────────────────────────────────────┘

1. Developer adds @extend_schema decorator to view
                           │
                           ▼
2. drf-spectacular scans decorators
   ├─ Extracts tags
   ├─ Extracts summary/description
   ├─ Extracts parameters
   └─ Extracts response schemas
                           │
                           ▼
3. OpenAPI Schema Generation
   ├─ Generates paths object
   ├─ Generates components schemas
   ├─ Generates security schemes
   └─ Creates complete OpenAPI 3.0 spec
                           │
                           ▼
4. Schema Served at /api/schema/
   ├─ JSON format
   └─ YAML format
                           │
                           ▼
5. Interactive UIs Generated
   ├─ Swagger UI (/api/docs/)
   │  ├─ Interactive API explorer
   │  ├─ Try-it-out functionality
   │  └─ Request/response examples
   │
   └─ ReDoc (/api/redoc/)
      ├─ Clean documentation view
      ├─ Search functionality
      └─ Code samples
```

---

## Key Components Relationship

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                        settings.py                                   │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  INSTALLED_APPS = [                                        │     │
│  │      'drf_spectacular',  ◄────────── Enables OpenAPI       │     │
│  │  ]                                                          │     │
│  │                                                             │     │
│  │  REST_FRAMEWORK = {                                         │     │
│  │      'DEFAULT_SCHEMA_CLASS':                               │     │
│  │          'drf_spectacular.openapi.AutoSchema' ◄─ Schema Gen│     │
│  │  }                                                          │     │
│  │                                                             │     │
│  │  SPECTACULAR_SETTINGS = {  ◄────────── API Metadata        │     │
│  │      'TITLE': 'MacroDash API',                             │     │
│  │      'VERSION': '1.0.0',                                   │     │
│  │  }                                                          │     │
│  └────────────────────────────────────────────────────────────┘     │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                          urls.py                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  urlpatterns = [                                           │     │
│  │      path('api/schema/',                                   │     │
│  │           SpectacularAPIView.as_view()),  ◄─ Schema endpoint│    │
│  │                                                             │     │
│  │      path('api/docs/',                                     │     │
│  │           SpectacularSwaggerView.as_view()), ◄─ Swagger UI │     │
│  │                                                             │     │
│  │      path('api/redoc/',                                    │     │
│  │           SpectacularRedocView.as_view()),  ◄─ ReDoc       │     │
│  │  ]                                                          │     │
│  └────────────────────────────────────────────────────────────┘     │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                         views.py                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  @extend_schema(  ◄─────────────── Documentation           │     │
│  │      tags=['Economic Data'],                               │     │
│  │      summary='Get economic indicators',                    │     │
│  │      description='...',                                    │     │
│  │      responses={200: {...}}                                │     │
│  │  )                                                          │     │
│  │  @api_view(['GET'])  ◄──────────── DRF compatibility       │     │
│  │  def economic_data(request):                               │     │
│  │      ...                                                    │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## File Structure Details

```
server/
│
├── api/
│   ├── tests/                    ◄── NEW: Test Suite
│   │   ├── __init__.py           ◄── Makes it a Python package
│   │   ├── base.py               ◄── Base test class (155 lines)
│   │   ├── test_economic_data.py ◄── Economic tests (103 lines)
│   │   ├── test_stocks.py        ◄── Stock tests (234 lines)
│   │   ├── test_alpha_vantage.py ◄── Alpha Vantage (251 lines)
│   │   ├── test_company.py       ◄── Company tests (221 lines)
│   │   ├── test_crypto.py        ◄── Crypto tests (233 lines)
│   │   ├── test_auth_admin.py    ◄── Auth tests (222 lines)
│   │   └── test_other_endpoints.py ◄── Other (496 lines)
│   │
│   ├── views.py                  ◄── MODIFIED: Added @extend_schema
│   └── ...
│
├── macrodash/
│   ├── settings.py               ◄── MODIFIED: Added drf-spectacular
│   ├── urls.py                   ◄── MODIFIED: Added doc endpoints
│   └── ...
│
├── TESTING_AND_DOCS.md           ◄── NEW: Comprehensive guide
├── WORK_SUMMARY.md               ◄── NEW: Sprint documentation
├── add_swagger_docs.py           ◄── NEW: API doc reference
├── requirements.txt              ◄── MODIFIED: Added drf-spectacular
└── schema.yml                    ◄── GENERATED: OpenAPI schema
```

🤖 Generated with Claude Code

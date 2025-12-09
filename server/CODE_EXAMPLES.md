# 💻 Code Examples - MacroDash Testing & Documentation

## Table of Contents
1. [Test Examples](#test-examples)
2. [Swagger Decorator Examples](#swagger-decorator-examples)
3. [Configuration Examples](#configuration-examples)
4. [Usage Examples](#usage-examples)

---

## 🧪 Test Examples

### Example 1: Basic GET Endpoint Test

```python
# File: api/tests/test_economic_data.py

from django.urls import reverse
from unittest.mock import patch, MagicMock
from .base import BaseAPITestCase

class EconomicDataTestCase(BaseAPITestCase):
    """Tests for economic data endpoints"""

    @patch('api.views.FREDService')
    def test_economic_data_success(self, mock_fred_service):
        """Test GET /api/economic-data/ returns economic indicators"""

        # ARRANGE: Set up mock service
        mock_service = MagicMock()
        mock_service.get_economic_indicators.return_value = {
            'status': 'success',
            'data': {
                'gdp': {'value': 25000.0, 'date': '2024-01-01'},
                'unemployment_rate': {'value': 3.7, 'date': '2024-01-01'}
            }
        }
        mock_fred_service.return_value = mock_service

        # ACT: Call the endpoint
        url = reverse('economic_data')
        response = self.client.get(url)

        # ASSERT: Verify response
        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)
```

### Example 2: Testing with Path Parameters

```python
# File: api/tests/test_stocks.py

@patch('api.views.YahooFinanceService')
def test_stock_detail_success(self, mock_yahoo_service):
    """Test GET /api/stocks/{symbol}/ returns stock details"""

    # ARRANGE
    mock_service = MagicMock()
    mock_service.get_stock_detail.return_value = {
        'status': 'success',
        'data': {
            'symbol': 'AAPL',
            'price': 150.0,
            'historical': [
                {'date': '2024-01-01', 'close': 148.0}
            ]
        }
    }
    mock_yahoo_service.return_value = mock_service

    # ACT
    url = reverse('stock_detail', kwargs={'symbol': 'AAPL'})
    response = self.client.get(url)

    # ASSERT
    self.assertSuccessResponse(response)
    data = response.json()
    self.assertEqual(data['data']['symbol'], 'AAPL')
    mock_service.get_stock_detail.assert_called_once_with('AAPL')
```

### Example 3: Testing with Query Parameters

```python
# File: api/tests/test_alpha_vantage.py

@patch('api.views.AlphaVantageService')
def test_alpha_vantage_intraday_custom_interval(self, mock_av_service):
    """Test intraday with custom interval parameter"""

    # ARRANGE
    mock_service = MagicMock()
    mock_service.get_intraday.return_value = {
        'status': 'success',
        'data': {'time_series': []}
    }
    mock_av_service.return_value = mock_service

    # ACT: Include query parameter
    url = reverse('alpha_vantage_intraday', kwargs={'symbol': 'AAPL'})
    response = self.client.get(url, {'interval': '15min'})

    # ASSERT: Verify the parameter was passed correctly
    self.assertSuccessResponse(response)
    mock_service.get_intraday.assert_called_once_with('AAPL', '15min')
```

### Example 4: Testing POST Endpoints

```python
# File: api/tests/test_stocks.py

def test_dashboard_config_post_success(self):
    """Test POST /api/dashboard/ updates dashboard configuration"""

    # ARRANGE
    url = reverse('dashboard_config')
    config_data = {
        'dashboard_layout': {
            'economic_indicators': {'enabled': True}
        },
        'preferences': {
            'theme': 'dark'
        }
    }

    # ACT
    response = self.client.post(
        url,
        data=config_data,
        content_type='application/json'
    )

    # ASSERT
    self.assertSuccessResponse(response)
    data = response.json()
    self.assertEqual(data['status'], 'success')
    self.assertIn('message', data)
```

### Example 5: Testing Authentication

```python
# File: api/tests/test_auth_admin.py

def test_current_user_authenticated(self):
    """Test GET /api/auth/user/ returns current user when authenticated"""

    # ARRANGE: Force login
    self.client.force_login(self.user)

    # ACT
    url = reverse('current_user')
    response = self.client.get(url)

    # ASSERT
    self.assertSuccessResponse(response)
    data = response.json()
    self.assertIn('user', data)
    self.assertEqual(data['user']['username'], 'testuser')

def test_current_user_unauthenticated(self):
    """Test GET /api/auth/user/ returns 401 when not authenticated"""

    # ACT: No login
    url = reverse('current_user')
    response = self.client.get(url)

    # ASSERT: Should return 401
    self.assertEqual(response.status_code, 401)
```

### Example 6: Testing Error Cases

```python
# File: api/tests/test_company.py

def test_company_financials_invalid_type(self):
    """Test financials endpoint with invalid type returns 400"""

    # ACT
    url = reverse('company_financials', kwargs={'symbol': 'AAPL'})
    response = self.client.get(url, {'type': 'invalid'})

    # ASSERT
    self.assertEqual(response.status_code, 400)
    data = response.json()
    self.assertIn('error', data)
    self.assertIn('Invalid statement type', data['error'])
```

### Example 7: Base Test Class

```python
# File: api/tests/base.py

from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class BaseAPITestCase(APITestCase):
    """Base test case with common setup and utilities"""

    def setUp(self):
        """Set up test fixtures"""
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        # Test stock symbols
        self.test_symbol = 'AAPL'
        self.test_crypto_symbol = 'BTC'
        self.test_series_id = 'GDP'

    def assertSuccessResponse(self, response, status_code=200):
        """Assert that a response is successful"""
        self.assertEqual(response.status_code, status_code)
        self.assertEqual(response['Content-Type'], 'application/json')

    def assertErrorResponse(self, response, status_code, error_message=None):
        """Assert that a response is an error"""
        self.assertEqual(response.status_code, status_code)
        if error_message:
            data = response.json()
            self.assertIn('error', data)
            self.assertEqual(data['error'], error_message)

    def create_mock_fred_response(self):
        """Create mock FRED API response"""
        return {
            'status': 'success',
            'data': {
                'gdp': {'value': 25000.0, 'date': '2024-01-01'},
                'unemployment_rate': {'value': 3.7, 'date': '2024-01-01'}
            }
        }
```

---

## 📚 Swagger Decorator Examples

### Example 1: Simple GET Endpoint

```python
# File: api/views.py

from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view

@extend_schema(
    tags=['Economic Data'],
    summary='Get economic indicators',
    description='Retrieve key economic indicators (GDP, unemployment, inflation, etc.) from FRED API',
    responses={
        200: {
            'type': 'object',
            'properties': {
                'status': {'type': 'string'},
                'data': {'type': 'object'}
            }
        },
        405: {'description': 'Method not allowed'}
    }
)
@api_view(['GET'])
def economic_data(request):
    """Real economic data from FRED API"""
    fred_service = FREDService()
    data = fred_service.get_economic_indicators()
    return JsonResponse(data)
```

### Example 2: Endpoint with Path Parameters

```python
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

@extend_schema(
    tags=['Stocks'],
    summary='Get stock details',
    description='Retrieve detailed information for a specific stock including historical data',
    parameters=[
        OpenApiParameter(
            name='symbol',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.PATH,
            description='Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)',
            required=True
        )
    ],
    responses={
        200: {'description': 'Stock details with historical price data'},
        404: {'description': 'Stock not found'},
        405: {'description': 'Method not allowed'}
    }
)
@api_view(['GET'])
def stock_detail(request, symbol):
    """Real individual stock details with historical data"""
    yahoo_service = YahooFinanceService()
    data = yahoo_service.get_stock_detail(symbol)
    return JsonResponse(data)
```

### Example 3: Endpoint with Query Parameters

```python
@extend_schema(
    tags=['Alpha Vantage'],
    summary='Get intraday time series',
    description='Retrieve intraday time series data from Alpha Vantage',
    parameters=[
        OpenApiParameter(
            name='symbol',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.PATH,
            description='Stock ticker symbol',
            required=True
        ),
        OpenApiParameter(
            name='interval',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description='Time interval (1min, 5min, 15min, 30min, 60min)',
            required=False,
            default='5min'
        )
    ],
    responses={
        200: {'description': 'Intraday time series data'},
        405: {'description': 'Method not allowed'}
    }
)
@api_view(['GET'])
def alpha_vantage_intraday(request, symbol):
    """Get intraday time series data from Alpha Vantage"""
    interval = request.GET.get('interval', '5min')
    av_service = AlphaVantageService()
    data = av_service.get_intraday(symbol, interval)
    return JsonResponse(data)
```

### Example 4: POST Endpoint

```python
@extend_schema(
    tags=['AI & Insights'],
    summary='AI chatbot',
    description='Interact with AI chatbot for market insights and analysis',
    request={
        'type': 'object',
        'properties': {
            'message': {
                'type': 'string',
                'description': 'User message to chatbot'
            },
            'conversation_id': {
                'type': 'string',
                'description': 'Optional conversation ID for context'
            }
        },
        'required': ['message']
    },
    responses={
        200: {
            'type': 'object',
            'properties': {
                'status': {'type': 'string'},
                'data': {
                    'type': 'object',
                    'properties': {
                        'response': {'type': 'string'},
                        'conversation_id': {'type': 'string'}
                    }
                }
            }
        },
        400: {'description': 'Invalid request'},
        405: {'description': 'Method not allowed'}
    }
)
@api_view(['POST'])
def chatbot(request):
    """AI chatbot endpoint"""
    # Implementation here
    pass
```

### Example 5: Multiple HTTP Methods

```python
@extend_schema(
    methods=['GET'],
    tags=['Price Alerts'],
    summary='List price alerts',
    description='Get all price alerts for the authenticated user',
    responses={
        200: {'description': 'List of price alerts'},
        401: {'description': 'Unauthorized'}
    }
)
@extend_schema(
    methods=['POST'],
    tags=['Price Alerts'],
    summary='Create price alert',
    description='Create a new price alert',
    request={
        'type': 'object',
        'properties': {
            'symbol': {'type': 'string'},
            'target_price': {'type': 'number'},
            'condition': {'type': 'string', 'enum': ['above', 'below']},
            'email': {'type': 'string', 'format': 'email'}
        }
    },
    responses={
        201: {'description': 'Alert created'},
        400: {'description': 'Invalid data'},
        401: {'description': 'Unauthorized'}
    }
)
@api_view(['GET', 'POST'])
def price_alerts(request):
    """Price alerts endpoint"""
    if request.method == 'GET':
        # List alerts
        pass
    elif request.method == 'POST':
        # Create alert
        pass
```

---

## ⚙️ Configuration Examples

### settings.py

```python
# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

# drf-spectacular settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'MacroDash API',
    'DESCRIPTION': 'Real-time economic dashboard API for tracking macroeconomic indicators, stock market data, and financial news',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'drf_spectacular',
    'api',
]
```

### urls.py

```python
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

urlpatterns = [
    path('api/', include('api.urls')),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

---

## 🚀 Usage Examples

### Running Tests

```bash
# Run all tests
python manage.py test api.tests

# Run all tests with verbose output
python manage.py test api.tests --verbosity=2

# Run specific test file
python manage.py test api.tests.test_stocks

# Run specific test class
python manage.py test api.tests.test_stocks.StockEndpointsTestCase

# Run specific test method
python manage.py test api.tests.test_stocks.StockEndpointsTestCase.test_stocks_list_success

# Run tests and keep database
python manage.py test api.tests --keepdb

# Run tests in parallel (faster)
python manage.py test api.tests --parallel
```

### Generating OpenAPI Schema

```bash
# Generate YAML schema
python manage.py spectacular --file schema.yml

# Generate JSON schema
python manage.py spectacular --format openapi-json --file schema.json

# Validate schema
python manage.py spectacular --validate

# Generate with color output
python manage.py spectacular --color --file schema.yml
```

### Testing API Endpoints Manually

```bash
# Start development server
python manage.py runserver

# Test endpoint with curl
curl http://127.0.0.1:8000/api/economic-data/

# Test with specific stock symbol
curl http://127.0.0.1:8000/api/stocks/AAPL/

# Test with query parameters
curl "http://127.0.0.1:8000/api/alpha-vantage/intraday/AAPL/?interval=15min"

# Test POST endpoint
curl -X POST http://127.0.0.1:8000/api/dashboard/ \
  -H "Content-Type: application/json" \
  -d '{"preferences": {"theme": "dark"}}'
```

### Accessing Documentation

```bash
# Start server
python manage.py runserver

# Open in browser:
# Swagger UI:    http://127.0.0.1:8000/api/docs/
# ReDoc:         http://127.0.0.1:8000/api/redoc/
# Schema:        http://127.0.0.1:8000/api/schema/
```

---

## 📊 Test Output Example

```bash
$ python manage.py test api.tests --verbosity=2

Creating test database for alias 'default'...
Operations to perform:
  Synchronize unmigrated apps: corsheaders, drf_spectacular, rest_framework
  Apply all migrations: admin, api, auth, contenttypes, sessions
Synchronizing apps without migrations:
  Creating tables...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...

test_alpha_vantage_daily_full_outputsize (api.tests.test_alpha_vantage.AlphaVantageEndpointsTestCase.test_alpha_vantage_daily_full_outputsize)
Test daily data with full outputsize parameter ... ok
test_alpha_vantage_daily_method_not_allowed (api.tests.test_alpha_vantage.AlphaVantageEndpointsTestCase.test_alpha_vantage_daily_method_not_allowed)
Test POST /api/alpha-vantage/daily/{symbol}/ returns 405 ... ok
test_alpha_vantage_daily_success (api.tests.test_alpha_vantage.AlphaVantageEndpointsTestCase.test_alpha_vantage_daily_success)
Test GET /api/alpha-vantage/daily/{symbol}/ returns daily data ... ok
...

----------------------------------------------------------------------
Ran 97 tests in 44.439s

OK
Destroying test database for alias 'default'...
```

---

## 🎯 Best Practices

### 1. Test Naming Convention
```python
# ✅ Good - Descriptive and follows pattern
def test_stocks_list_success(self):
def test_stock_detail_invalid_symbol(self):
def test_dashboard_config_unauthenticated(self):

# ❌ Bad - Unclear what is being tested
def test_stocks(self):
def test_api(self):
def test_error(self):
```

### 2. Arrange-Act-Assert Pattern
```python
def test_example(self):
    # ARRANGE - Set up test data
    mock_data = {'status': 'success'}

    # ACT - Perform the action
    response = self.client.get(url)

    # ASSERT - Verify the result
    self.assertEqual(response.status_code, 200)
```

### 3. Use Descriptive Docstrings
```python
# ✅ Good
def test_stocks_list_success(self):
    """Test GET /api/stocks/ returns market data"""

# ❌ Bad
def test_stocks_list_success(self):
    """Test stocks"""
```

### 4. Mock External Services
```python
# ✅ Good - Mocks external service
@patch('api.views.YahooFinanceService')
def test_stocks_list_success(self, mock_service):
    mock_service.get_market_data.return_value = {...}

# ❌ Bad - Calls real external API
def test_stocks_list_success(self):
    response = self.client.get(url)  # Will call real Yahoo Finance API
```

🤖 Generated with Claude Code

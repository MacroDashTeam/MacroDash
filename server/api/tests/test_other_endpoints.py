"""
Unit tests for other endpoints (Alerts, Charts, Technical Indicators, AI, Data Explorer).
"""
from django.urls import reverse
from unittest.mock import patch, MagicMock
from .base import BaseAPITestCase
from api.models import PriceAlert


class PriceAlertEndpointsTestCase(BaseAPITestCase):
    """Tests for price alert endpoints"""

    def test_price_alerts_get_success(self):
        """Test GET /api/alerts/ returns user's price alerts"""
        url = reverse('price_alerts')
        response = self.client.get(url, {'email': 'test@example.com'})

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)

    def test_price_alerts_post_success(self):
        """Test POST /api/alerts/ creates a new price alert"""
        url = reverse('price_alerts')
        alert_data = {
            'symbol': 'AAPL',
            'target_price': 150.0,
            'condition': 'above',
            'email': 'test@example.com'
        }
        response = self.client.post(
            url,
            data=alert_data,
            content_type='application/json'
        )

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)

    def test_price_alerts_unauthenticated(self):
        """Test price alerts endpoint requires email parameter"""
        url = reverse('price_alerts')
        response = self.client.get(url)  # Missing email parameter

        self.assertEqual(response.status_code, 400)  # Bad request without email

    def test_price_alert_detail_get_success(self):
        """Test GET /api/alerts/{id}/ returns specific alert"""
        # Create an alert first
        alert = PriceAlert.objects.create(
            symbol='AAPL',
            target_price=150.0,
            condition='above',
            email='test@example.com'
        )

        url = reverse('price_alert_detail', kwargs={'alert_id': alert.id})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)

    def test_price_alert_detail_delete_success(self):
        """Test DELETE /api/alerts/{id}/ cancels alert"""
        # Create an alert first
        alert = PriceAlert.objects.create(
            symbol='AAPL',
            target_price=150.0,
            condition='above',
            email='test@example.com'
        )

        url = reverse('price_alert_detail', kwargs={'alert_id': alert.id})
        response = self.client.delete(url)

        self.assertSuccessResponse(response)

        # Verify alert was cancelled (not deleted, just status changed)
        alert.refresh_from_db()
        self.assertEqual(alert.status, 'cancelled')

    def test_price_alert_detail_not_found(self):
        """Test GET /api/alerts/{id}/ with invalid ID returns 404"""
        url = reverse('price_alert_detail', kwargs={'alert_id': 9999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)


class TechnicalIndicatorEndpointsTestCase(BaseAPITestCase):
    """Tests for technical indicator endpoints"""

    @patch('api.views.TechnicalIndicatorService')
    def test_technical_indicators_success(self, mock_ti_service):
        """Test GET /api/technical-indicators/{symbol}/ returns indicators"""
        mock_service = MagicMock()
        mock_service.get_technical_indicators.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'indicators': {
                    'sma': 150.0,
                    'rsi': 65.0
                }
            }
        }
        mock_ti_service.return_value = mock_service

        url = reverse('technical_indicators', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.TechnicalIndicatorService')
    def test_technical_indicators_method_not_allowed(self, mock_ti_service):
        """Test POST /api/technical-indicators/{symbol}/ returns 405"""
        url = reverse('technical_indicators', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')


class AIInsightsEndpointsTestCase(BaseAPITestCase):
    """Tests for AI insights endpoints"""

    @patch('api.views.OpenAIService')
    def test_chatbot_success(self, mock_openai_service):
        """Test POST /api/chatbot/ returns AI response"""
        mock_service = MagicMock()
        mock_service.chat_with_context.return_value = {
            'status': 'success',
            'data': {
                'response': 'AI response here',
                'conversation_id': '123'
            }
        }
        mock_openai_service.return_value = mock_service

        url = reverse('chatbot')
        chat_data = {
            'question': 'What is the current market trend?',
            'context': {}
        }
        response = self.client.post(
            url,
            data=chat_data,
            content_type='application/json'
        )

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.OpenAIService')
    def test_chatbot_method_not_allowed(self, mock_openai_service):
        """Test GET /api/chatbot/ returns 405"""
        url = reverse('chatbot')
        response = self.client.get(url)

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.OpenAIService')
    def test_all_insights_success(self, mock_openai_service):
        """Test GET /api/ai-insights/ returns all AI insights"""
        mock_service = MagicMock()
        mock_service.get_all_insights.return_value = {
            'status': 'success',
            'data': {
                'insights': []
            }
        }
        mock_openai_service.return_value = mock_service

        url = reverse('all_ai_insights')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.OpenAIService')
    def test_ai_stock_insights_success(self, mock_openai_service):
        """Test GET /api/ai-insights/{symbol}/ returns stock-specific insights"""
        mock_service = MagicMock()
        mock_service.get_stock_insights.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'insights': 'AI insights for AAPL'
            }
        }
        mock_openai_service.return_value = mock_service

        url = reverse('ai_stock_insights', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.StatsmodelsService')
    def test_custom_analysis_success(self, mock_stats_service):
        """Test POST /api/custom-analysis/ returns custom analysis"""
        mock_service = MagicMock()
        mock_service.get_price_data.return_value = {
            'status': 'success',
            'data': {
                'Close': [150.0, 151.0, 152.0],
                'Open': [149.0, 150.0, 151.0]
            }
        }
        mock_service.evaluate_formulas.return_value = {
            'status': 'success',
            'data': {
                'results': [165.0, 166.1, 167.2]
            }
        }
        mock_stats_service.return_value = mock_service

        url = reverse('custom_analysis')
        analysis_data = {
            'symbols': ['AAPL'],
            'formulas': ['Close * 1.1'],
            'period': '1y'
        }
        response = self.client.post(
            url,
            data=analysis_data,
            content_type='application/json'
        )

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')


class DataExplorerEndpointsTestCase(BaseAPITestCase):
    """Tests for data explorer endpoints"""

    @patch('api.views.FREDService')
    def test_search_data_success(self, mock_fred_service):
        """Test GET /api/search/ searches data"""
        mock_service = MagicMock()
        mock_service.search_combined.return_value = {
            'status': 'success',
            'data': {
                'results': []
            }
        }
        mock_fred_service.return_value = mock_service

        url = reverse('search_data')
        response = self.client.get(url, {'q': 'GDP'})

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.FREDService')
    def test_fred_categories_success(self, mock_fred_service):
        """Test GET /api/fred/categories/ returns FRED categories"""
        mock_service = MagicMock()
        mock_service.get_fred_categories.return_value = {
            'status': 'success',
            'data': {
                'categories': []
            }
        }
        mock_fred_service.return_value = mock_service

        url = reverse('fred_categories')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.FREDService')
    def test_fred_category_series_success(self, mock_fred_service):
        """Test GET /api/fred/categories/{id}/series/ returns series in category"""
        mock_service = MagicMock()
        mock_service.get_series_in_category.return_value = {
            'status': 'success',
            'data': {
                'series': []
            }
        }
        mock_fred_service.return_value = mock_service

        url = reverse('fred_category_series', kwargs={'category_id': 1})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.FREDService')
    def test_fred_series_metadata_success(self, mock_fred_service):
        """Test GET /api/fred/series/{id}/metadata/ returns series metadata"""
        mock_service = MagicMock()
        mock_service.get_series_metadata.return_value = {
            'status': 'success',
            'data': {
                'series_id': 'GDP',
                'metadata': {}
            }
        }
        mock_fred_service.return_value = mock_service

        url = reverse('fred_series_metadata', kwargs={'series_id': 'GDP'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.FREDService')
    def test_export_data_success(self, mock_fred_service):
        """Test POST /api/export/ exports data"""
        mock_service = MagicMock()
        mock_service.export_multiple_series.return_value = {
            'status': 'success',
            'data': {
                'file_url': 'https://example.com/export.json'
            }
        }
        mock_fred_service.return_value = mock_service

        url = reverse('export_data')
        export_data = {
            'series_ids': ['GDP', 'UNRATE'],
            'filename': 'economic_data.json'
        }
        response = self.client.post(
            url,
            data=export_data,
            content_type='application/json'
        )

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')


class SavedChartsEndpointsTestCase(BaseAPITestCase):
    """Tests for saved charts endpoints"""

    def test_saved_charts_get_success(self):
        """Test GET /api/charts/ returns saved charts"""
        self.client.force_login(user=self.user)
        url = reverse('saved_charts')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)

    def test_saved_charts_post_success(self):
        """Test POST /api/charts/ creates a new saved chart"""
        self.client.force_login(user=self.user)
        url = reverse('saved_charts')
        chart_data = {
            'chart_name': 'My Chart',
            'series_ids': ['GDP', 'UNRATE'],
            'series_metadata': {},
            'source_type': 'fred'
        }
        response = self.client.post(
            url,
            data=chart_data,
            content_type='application/json'
        )

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)

    def test_saved_charts_unauthenticated(self):
        """Test saved charts endpoint requires authentication"""
        url = reverse('saved_charts')
        response = self.client.get(url)

        # Should return 401 since authentication is now required
        self.assertErrorResponse(response, 401)

    @patch('api.views.FREDService')
    def test_chart_data_success(self, mock_fred_service):
        """Test GET /api/charts/{id}/data/ returns chart data"""
        from api.models import SavedChartDisplay
        import pandas as pd
        from datetime import datetime, timedelta

        # Authenticate user
        self.client.force_login(user=self.user)

        # Create a saved chart associated with the authenticated user
        chart = SavedChartDisplay.objects.create(
            user=self.user,
            chart_name='Test Chart',
            series_ids=['GDP'],
            series_metadata={},
            source_type='fred'
        )

        # Mock the fred.get_series() method to return a pandas Series with datetime index
        mock_service = MagicMock()
        mock_fred_api = MagicMock()

        # Create a pandas Series with datetime index
        dates = [datetime.now() - timedelta(days=i) for i in range(3)]
        series_data = pd.Series([25000.0, 25100.0, 25200.0], index=dates)
        mock_fred_api.get_series.return_value = series_data
        mock_service.fred = mock_fred_api
        mock_fred_service.return_value = mock_service

        url = reverse('chart_data', kwargs={'chart_id': chart.id})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')


class BrowseStocksEndpointsTestCase(BaseAPITestCase):
    """Tests for browse stocks endpoint"""

    @patch('api.views.YahooFinanceService')
    def test_browse_stocks_success(self, mock_yahoo_service):
        """Test GET /api/stocks/browse/ returns browsable stock list"""
        mock_service = MagicMock()
        mock_service.browse_stocks.return_value = {
            'status': 'success',
            'data': {
                'stocks': []
            }
        }
        mock_yahoo_service.return_value = mock_service

        url = reverse('browse_stocks')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.YahooFinanceService')
    def test_browse_stocks_with_filters(self, mock_yahoo_service):
        """Test browse stocks with sector and market cap filters"""
        mock_service = MagicMock()
        mock_service.browse_stocks.return_value = {'status': 'success', 'data': {}}
        mock_yahoo_service.return_value = mock_service

        url = reverse('browse_stocks')
        response = self.client.get(url, {
            'sector': 'Technology',
            'min_market_cap': '1000000000'
        })

        self.assertSuccessResponse(response)

    @patch('api.views.YahooFinanceService')
    def test_browse_stocks_method_not_allowed(self, mock_yahoo_service):
        """Test POST /api/stocks/browse/ returns 405"""
        url = reverse('browse_stocks')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

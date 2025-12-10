"""
Unit tests for Stock endpoints.
"""
from django.urls import reverse
from unittest.mock import patch, MagicMock
from .base import BaseAPITestCase


class StockEndpointsTestCase(BaseAPITestCase):
    """Tests for stock-related endpoints"""

    @patch('api.views.YahooFinanceService')
    def test_stocks_list_success(self, mock_yahoo_service):
        """Test GET /api/stocks/ returns market data"""
        mock_service = MagicMock()
        mock_service.get_market_data.return_value = {
            'status': 'success',
            'data': {
                'stocks': [
                    {'symbol': 'AAPL', 'price': 150.0, 'change': 2.5}
                ]
            }
        }
        mock_yahoo_service.return_value = mock_service

        url = reverse('stocks_list')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_market_data.assert_called_once()

    @patch('api.views.YahooFinanceService')
    def test_stocks_list_method_not_allowed(self, mock_yahoo_service):
        """Test POST /api/stocks/ returns 405"""
        url = reverse('stocks_list')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.YahooFinanceService')
    def test_stock_detail_success(self, mock_yahoo_service):
        """Test GET /api/stocks/{symbol}/ returns stock details"""
        mock_service = MagicMock()
        mock_service.get_stock_detail.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'price': 150.0,
                'historical': []
            }
        }
        mock_yahoo_service.return_value = mock_service

        url = reverse('stock_detail', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_stock_detail.assert_called_once_with('AAPL')

    @patch('api.views.YahooFinanceService')
    def test_stock_detail_method_not_allowed(self, mock_yahoo_service):
        """Test POST /api/stocks/{symbol}/ returns 405"""
        url = reverse('stock_detail', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.YahooFinanceService')
    def test_stocks_intraday_success(self, mock_yahoo_service):
        """Test GET /api/stocks/intraday/ returns intraday data"""
        mock_service = MagicMock()
        mock_service.get_intraday_data.return_value = {
            'status': 'success',
            'data': {
                'indices': {
                    'SPY': {'price': 450.0, 'change': 1.2}
                }
            }
        }
        mock_yahoo_service.return_value = mock_service

        url = reverse('stocks_intraday')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_intraday_data.assert_called_once()

    @patch('api.views.YahooFinanceService')
    def test_stocks_intraday_method_not_allowed(self, mock_yahoo_service):
        """Test POST /api/stocks/intraday/ returns 405"""
        url = reverse('stocks_intraday')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    def test_stock_news_success(self):
        """Test GET /api/news/{symbol}/ returns news articles"""
        url = reverse('stock_news', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)
        self.assertIn('symbol', data['data'])
        self.assertEqual(data['data']['symbol'], 'AAPL')
        self.assertIn('news', data['data'])

    def test_stock_news_symbol_uppercase(self):
        """Test that symbol is converted to uppercase in news"""
        url = reverse('stock_news', kwargs={'symbol': 'aapl'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['data']['symbol'], 'AAPL')

    def test_stock_news_method_not_allowed(self):
        """Test POST /api/news/{symbol}/ returns 405"""
        url = reverse('stock_news', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    def test_sentiment_analysis_success(self):
        """Test GET /api/sentiment/{symbol}/ returns sentiment data"""
        url = reverse('sentiment_analysis', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)
        self.assertIn('symbol', data['data'])
        self.assertEqual(data['data']['symbol'], 'AAPL')
        self.assertIn('overall_sentiment', data['data'])
        self.assertIn('sentiment_score', data['data'])

    def test_sentiment_analysis_method_not_allowed(self):
        """Test POST /api/sentiment/{symbol}/ returns 405"""
        url = reverse('sentiment_analysis', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    def test_dashboard_config_get_success(self):
        """Test GET /api/dashboard/ returns dashboard configuration"""
        url = reverse('dashboard_config')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)
        self.assertIn('dashboard_layout', data['data'])
        self.assertIn('preferences', data['data'])

    def test_dashboard_config_post_success(self):
        """Test POST /api/dashboard/ updates dashboard configuration"""
        url = reverse('dashboard_config')
        config_data = {
            'dashboard_layout': {
                'economic_indicators': {'enabled': True}
            },
            'preferences': {
                'theme': 'dark'
            }
        }
        response = self.client.post(
            url,
            data=config_data,
            content_type='application/json'
        )

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('message', data)

    def test_dashboard_config_post_invalid_json(self):
        """Test POST /api/dashboard/ with invalid JSON returns 400"""
        url = reverse('dashboard_config')
        response = self.client.post(
            url,
            data='invalid json',
            content_type='application/json'
        )

        self.assertErrorResponse(response, 400, 'Invalid JSON')

    def test_dashboard_config_method_not_allowed(self):
        """Test PUT /api/dashboard/ returns 405"""
        url = reverse('dashboard_config')
        response = self.client.put(url, {})

        # DRF returns 'Method "PUT" not allowed.' format
        self.assertEqual(response.status_code, 405)

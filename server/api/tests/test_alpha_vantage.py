"""
Unit tests for Alpha Vantage endpoints.
"""
from django.urls import reverse
from unittest.mock import patch, MagicMock
from .base import BaseAPITestCase


class AlphaVantageEndpointsTestCase(BaseAPITestCase):
    """Tests for Alpha Vantage API endpoints"""

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_quote_success(self, mock_av_service):
        """Test GET /api/alpha-vantage/quote/{symbol}/ returns quote data"""
        mock_service = MagicMock()
        mock_service.get_quote.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'price': 150.0,
                'volume': 1000000
            }
        }
        mock_av_service.return_value = mock_service

        url = reverse('alpha_vantage_quote', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_quote.assert_called_once_with('AAPL')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_quote_method_not_allowed(self, mock_av_service):
        """Test POST /api/alpha-vantage/quote/{symbol}/ returns 405"""
        url = reverse('alpha_vantage_quote', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_intraday_success(self, mock_av_service):
        """Test GET /api/alpha-vantage/intraday/{symbol}/ returns intraday data"""
        mock_service = MagicMock()
        mock_service.get_intraday.return_value = {
            'status': 'success',
            'data': {'time_series': []}
        }
        mock_av_service.return_value = mock_service

        url = reverse('alpha_vantage_intraday', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        mock_service.get_intraday.assert_called_once_with('AAPL', '5min')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_intraday_custom_interval(self, mock_av_service):
        """Test intraday with custom interval parameter"""
        mock_service = MagicMock()
        mock_service.get_intraday.return_value = {'status': 'success', 'data': {}}
        mock_av_service.return_value = mock_service

        url = reverse('alpha_vantage_intraday', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url, {'interval': '15min'})

        self.assertSuccessResponse(response)
        mock_service.get_intraday.assert_called_once_with('AAPL', '15min')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_intraday_method_not_allowed(self, mock_av_service):
        """Test POST /api/alpha-vantage/intraday/{symbol}/ returns 405"""
        url = reverse('alpha_vantage_intraday', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_daily_success(self, mock_av_service):
        """Test GET /api/alpha-vantage/daily/{symbol}/ returns daily data"""
        mock_service = MagicMock()
        mock_service.get_daily.return_value = {
            'status': 'success',
            'data': {'time_series': []}
        }
        mock_av_service.return_value = mock_service

        url = reverse('alpha_vantage_daily', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        mock_service.get_daily.assert_called_once_with('AAPL', 'compact')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_daily_full_outputsize(self, mock_av_service):
        """Test daily data with full outputsize parameter"""
        mock_service = MagicMock()
        mock_service.get_daily.return_value = {'status': 'success', 'data': {}}
        mock_av_service.return_value = mock_service

        url = reverse('alpha_vantage_daily', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url, {'outputsize': 'full'})

        self.assertSuccessResponse(response)
        mock_service.get_daily.assert_called_once_with('AAPL', 'full')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_daily_method_not_allowed(self, mock_av_service):
        """Test POST /api/alpha-vantage/daily/{symbol}/ returns 405"""
        url = reverse('alpha_vantage_daily', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_overview_success(self, mock_av_service):
        """Test GET /api/alpha-vantage/overview/{symbol}/ returns company overview"""
        mock_service = MagicMock()
        mock_service.get_company_overview.return_value = {
            'status': 'success',
            'data': {
                'Symbol': 'AAPL',
                'Name': 'Apple Inc.',
                'MarketCapitalization': '2500000000000'
            }
        }
        mock_av_service.return_value = mock_service

        url = reverse('alpha_vantage_overview', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_company_overview.assert_called_once_with('AAPL')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_overview_method_not_allowed(self, mock_av_service):
        """Test POST /api/alpha-vantage/overview/{symbol}/ returns 405"""
        url = reverse('alpha_vantage_overview', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_news_success(self, mock_av_service):
        """Test GET /api/alpha-vantage/news/ returns news data"""
        mock_service = MagicMock()
        mock_service.get_news_sentiment.return_value = {
            'status': 'success',
            'data': {'feed': []}
        }
        mock_av_service.return_value = mock_service

        url = reverse('alpha_vantage_news')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        mock_service.get_news_sentiment.assert_called_once_with(
            tickers=None,
            topics=None,
            limit=50
        )

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_news_with_parameters(self, mock_av_service):
        """Test news endpoint with ticker, topic, and limit parameters"""
        mock_service = MagicMock()
        mock_service.get_news_sentiment.return_value = {'status': 'success', 'data': {}}
        mock_av_service.return_value = mock_service

        url = reverse('alpha_vantage_news')
        response = self.client.get(url, {
            'tickers': 'AAPL,MSFT',
            'topics': 'technology',
            'limit': '25'
        })

        self.assertSuccessResponse(response)
        mock_service.get_news_sentiment.assert_called_once_with(
            tickers='AAPL,MSFT',
            topics='technology',
            limit=25
        )

    @patch('api.views.AlphaVantageService')
    def test_alpha_vantage_news_method_not_allowed(self, mock_av_service):
        """Test POST /api/alpha-vantage/news/ returns 405"""
        url = reverse('alpha_vantage_news')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

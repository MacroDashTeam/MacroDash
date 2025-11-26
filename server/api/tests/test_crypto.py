"""
Unit tests for Cryptocurrency endpoints.
"""
from django.urls import reverse
from unittest.mock import patch, MagicMock
from .base import BaseAPITestCase


class CryptoEndpointsTestCase(BaseAPITestCase):
    """Tests for cryptocurrency-related endpoints"""

    @patch('api.views.CoinMarketCapService')
    def test_crypto_listings_success(self, mock_cmc_service):
        """Test GET /api/crypto/ returns cryptocurrency listings"""
        mock_service = MagicMock()
        mock_service.get_listings.return_value = {
            'status': 'success',
            'data': {
                'cryptocurrencies': [
                    {'symbol': 'BTC', 'name': 'Bitcoin', 'price': 50000.0}
                ]
            }
        }
        mock_cmc_service.return_value = mock_service

        url = reverse('crypto_listings')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_listings.assert_called_once()

    @patch('api.views.CoinMarketCapService')
    def test_crypto_listings_method_not_allowed(self, mock_cmc_service):
        """Test POST /api/crypto/ returns 405"""
        url = reverse('crypto_listings')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.CoinMarketCapService')
    def test_crypto_top_gainers_success(self, mock_cmc_service):
        """Test GET /api/crypto/top/gainers/ returns top gaining cryptocurrencies"""
        mock_service = MagicMock()
        mock_service.get_top_gainers.return_value = {
            'status': 'success',
            'data': {
                'top_gainers': []
            }
        }
        mock_cmc_service.return_value = mock_service

        url = reverse('crypto_top_gainers')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_top_gainers.assert_called_once()

    @patch('api.views.CoinMarketCapService')
    def test_crypto_top_gainers_method_not_allowed(self, mock_cmc_service):
        """Test POST /api/crypto/top/gainers/ returns 405"""
        url = reverse('crypto_top_gainers')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.CoinMarketCapService')
    def test_crypto_top_losers_success(self, mock_cmc_service):
        """Test GET /api/crypto/top/losers/ returns top losing cryptocurrencies"""
        mock_service = MagicMock()
        mock_service.get_top_losers.return_value = {
            'status': 'success',
            'data': {
                'top_losers': []
            }
        }
        mock_cmc_service.return_value = mock_service

        url = reverse('crypto_top_losers')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_top_losers.assert_called_once()

    @patch('api.views.CoinMarketCapService')
    def test_crypto_top_losers_method_not_allowed(self, mock_cmc_service):
        """Test POST /api/crypto/top/losers/ returns 405"""
        url = reverse('crypto_top_losers')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.CoinGeckoService')
    def test_crypto_detail_success(self, mock_cg_service):
        """Test GET /api/crypto/{symbol}/ returns cryptocurrency details"""
        mock_service = MagicMock()
        mock_service.get_coin_data.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'BTC',
                'name': 'Bitcoin',
                'price': 50000.0
            }
        }
        mock_cg_service.return_value = mock_service

        url = reverse('crypto_detail', kwargs={'symbol': 'BTC'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.CoinGeckoService')
    def test_crypto_detail_method_not_allowed(self, mock_cg_service):
        """Test POST /api/crypto/{symbol}/ returns 405"""
        url = reverse('crypto_detail', kwargs={'symbol': 'BTC'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.CoinGeckoService')
    def test_crypto_historical_success(self, mock_cg_service):
        """Test GET /api/crypto/{symbol}/historical/ returns historical data"""
        mock_service = MagicMock()
        mock_service.get_historical_data.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'BTC',
                'prices': []
            }
        }
        mock_cg_service.return_value = mock_service

        url = reverse('crypto_historical', kwargs={'symbol': 'BTC'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.CoinGeckoService')
    def test_crypto_historical_with_days_parameter(self, mock_cg_service):
        """Test historical data with days parameter"""
        mock_service = MagicMock()
        mock_service.get_historical_data.return_value = {'status': 'success', 'data': {}}
        mock_cg_service.return_value = mock_service

        url = reverse('crypto_historical', kwargs={'symbol': 'BTC'})
        response = self.client.get(url, {'days': '30'})

        self.assertSuccessResponse(response)

    @patch('api.views.CoinGeckoService')
    def test_crypto_historical_method_not_allowed(self, mock_cg_service):
        """Test POST /api/crypto/{symbol}/historical/ returns 405"""
        url = reverse('crypto_historical', kwargs={'symbol': 'BTC'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.CoinGeckoService')
    def test_crypto_ohlc_success(self, mock_cg_service):
        """Test GET /api/crypto/{symbol}/ohlc/ returns OHLC data"""
        mock_service = MagicMock()
        mock_service.get_ohlc.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'BTC',
                'ohlc': []
            }
        }
        mock_cg_service.return_value = mock_service

        url = reverse('crypto_ohlc', kwargs={'symbol': 'BTC'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.CoinGeckoService')
    def test_crypto_ohlc_method_not_allowed(self, mock_cg_service):
        """Test POST /api/crypto/{symbol}/ohlc/ returns 405"""
        url = reverse('crypto_ohlc', kwargs={'symbol': 'BTC'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

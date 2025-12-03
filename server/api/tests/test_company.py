"""
Unit tests for Company endpoints.
"""
from django.urls import reverse
from unittest.mock import patch, MagicMock
from .base import BaseAPITestCase


class CompanyEndpointsTestCase(BaseAPITestCase):
    """Tests for company-related endpoints"""

    @patch('api.views.YahooFinanceService')
    def test_company_financials_income_success(self, mock_yahoo_service):
        """Test GET /api/company/{symbol}/financials/?type=income returns income statement"""
        mock_service = MagicMock()
        mock_service.get_financials.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'statement_type': 'income',
                'financials': []
            }
        }
        mock_yahoo_service.return_value = mock_service

        url = reverse('company_financials', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url, {'type': 'income'})

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_financials.assert_called_once_with('AAPL', 'income')

    @patch('api.views.YahooFinanceService')
    def test_company_financials_balance_success(self, mock_yahoo_service):
        """Test GET /api/company/{symbol}/financials/?type=balance returns balance sheet"""
        mock_service = MagicMock()
        mock_service.get_financials.return_value = {'status': 'success', 'data': {}}
        mock_yahoo_service.return_value = mock_service

        url = reverse('company_financials', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url, {'type': 'balance'})

        self.assertSuccessResponse(response)
        mock_service.get_financials.assert_called_once_with('AAPL', 'balance')

    @patch('api.views.YahooFinanceService')
    def test_company_financials_cashflow_success(self, mock_yahoo_service):
        """Test GET /api/company/{symbol}/financials/?type=cashflow returns cash flow statement"""
        mock_service = MagicMock()
        mock_service.get_financials.return_value = {'status': 'success', 'data': {}}
        mock_yahoo_service.return_value = mock_service

        url = reverse('company_financials', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url, {'type': 'cashflow'})

        self.assertSuccessResponse(response)
        mock_service.get_financials.assert_called_once_with('AAPL', 'cashflow')

    @patch('api.views.YahooFinanceService')
    def test_company_financials_default_type(self, mock_yahoo_service):
        """Test financials endpoint defaults to income statement"""
        mock_service = MagicMock()
        mock_service.get_financials.return_value = {'status': 'success', 'data': {}}
        mock_yahoo_service.return_value = mock_service

        url = reverse('company_financials', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        mock_service.get_financials.assert_called_once_with('AAPL', 'income')

    def test_company_financials_invalid_type(self):
        """Test financials endpoint with invalid type returns 400"""
        url = reverse('company_financials', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url, {'type': 'invalid'})

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('Invalid statement type', data['error'])

    @patch('api.views.YahooFinanceService')
    def test_company_financials_method_not_allowed(self, mock_yahoo_service):
        """Test POST /api/company/{symbol}/financials/ returns 405"""
        url = reverse('company_financials', kwargs={'symbol': 'AAPL'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.AlphaVantageService')
    def test_company_earnings_success(self, mock_av_service):
        """Test GET /api/company/{symbol}/earnings/ returns earnings data"""
        mock_service = MagicMock()
        mock_service.get_earnings.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'quarterly_earnings': []
            }
        }
        mock_av_service.return_value = mock_service

        url = reverse('company_earnings', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.YahooFinanceService')
    def test_analyst_recommendations_success(self, mock_yahoo_service):
        """Test GET /api/company/{symbol}/analyst-recommendations/ returns analyst data"""
        mock_service = MagicMock()
        mock_service.get_analyst_recommendations.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'recommendations': []
            }
        }
        mock_yahoo_service.return_value = mock_service

        url = reverse('analyst_recommendations', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.OpenAIService')
    def test_stock_insights_success(self, mock_openai_service):
        """Test GET /api/company/{symbol}/insights/ returns AI-generated insights"""
        mock_service = MagicMock()
        mock_service.generate_stock_insights.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'insights': 'AI-generated insights here'
            }
        }
        mock_openai_service.return_value = mock_service

        url = reverse('stock_insights', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

    @patch('api.views.YahooFinanceService')
    def test_company_overview_yahoo_success(self, mock_yahoo_service):
        """Test GET /api/company/{symbol}/overview/ returns company overview"""
        mock_service = MagicMock()
        mock_service.get_company_info.return_value = {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'name': 'Apple Inc.',
                'sector': 'Technology'
            }
        }
        mock_yahoo_service.return_value = mock_service

        url = reverse('company_overview_yahoo', kwargs={'symbol': 'AAPL'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')

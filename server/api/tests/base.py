"""
Base test class with common fixtures and utilities for MacroDash API tests.
"""
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock


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
        """Assert that a response is successful with the given status code"""
        self.assertEqual(response.status_code, status_code)
        self.assertEqual(response['Content-Type'], 'application/json')

    def assertErrorResponse(self, response, status_code, error_message=None):
        """Assert that a response is an error with the given status code"""
        self.assertEqual(response.status_code, status_code)
        if error_message:
            data = response.json()
            # Check for either 'error' or 'detail' field (DRF uses 'detail')
            self.assertTrue('error' in data or 'detail' in data,
                          f"Response must contain 'error' or 'detail' field. Got: {data}")
            if 'error' in data:
                self.assertIn(error_message, data['error'])
            elif 'detail' in data:
                self.assertIn(error_message, data['detail'])

    def create_mock_fred_response(self):
        """Create mock FRED API response"""
        return {
            'status': 'success',
            'data': {
                'gdp': {'value': 25000.0, 'date': '2024-01-01'},
                'unemployment_rate': {'value': 3.7, 'date': '2024-01-01'},
                'inflation_rate': {'value': 2.5, 'date': '2024-01-01'}
            }
        }

    def create_mock_yahoo_response(self):
        """Create mock Yahoo Finance API response"""
        return {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'price': 150.0,
                'change': 2.5,
                'percent_change': 1.7
            }
        }

    def create_mock_alpha_vantage_response(self):
        """Create mock Alpha Vantage API response"""
        return {
            'status': 'success',
            'data': {
                'symbol': 'AAPL',
                'price': 150.0,
                'volume': 1000000
            }
        }

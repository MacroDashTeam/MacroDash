"""
Unit tests for Economic Data endpoints.
"""
from django.urls import reverse
from unittest.mock import patch, MagicMock
from .base import BaseAPITestCase


class EconomicDataTestCase(BaseAPITestCase):
    """Tests for economic data endpoints"""

    @patch('api.views.FREDService')
    def test_economic_data_success(self, mock_fred_service):
        """Test GET /api/economic-data/ returns economic indicators"""
        # Mock the FRED service
        mock_service = MagicMock()
        mock_service.get_economic_indicators.return_value = self.create_mock_fred_response()
        mock_fred_service.return_value = mock_service

        url = reverse('economic_data')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)

    @patch('api.views.FREDService')
    def test_economic_data_method_not_allowed(self, mock_fred_service):
        """Test POST /api/economic-data/ returns 405"""
        url = reverse('economic_data')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

    @patch('api.views.FREDService')
    def test_economic_indicator_detail_success(self, mock_fred_service):
        """Test GET /api/economic-data/{series_id}/ returns indicator details"""
        # Mock the FRED service
        mock_service = MagicMock()
        mock_service.get_single_indicator.return_value = {
            'status': 'success',
            'data': {
                'series_id': 'GDP',
                'title': 'Gross Domestic Product',
                'values': [
                    {'date': '2024-01-01', 'value': 25000.0}
                ]
            }
        }
        mock_fred_service.return_value = mock_service

        url = reverse('economic_indicator_detail', kwargs={'series_id': 'GDP'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        mock_service.get_single_indicator.assert_called_once_with('GDP')

    @patch('api.views.FREDService')
    def test_economic_indicator_detail_lowercase_series_id(self, mock_fred_service):
        """Test that series_id is converted to uppercase"""
        mock_service = MagicMock()
        mock_service.get_single_indicator.return_value = {'status': 'success', 'data': {}}
        mock_fred_service.return_value = mock_service

        url = reverse('economic_indicator_detail', kwargs={'series_id': 'gdp'})
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        # Verify the series_id was converted to uppercase
        mock_service.get_single_indicator.assert_called_once_with('GDP')

    @patch('api.views.FREDService')
    def test_economic_indicator_detail_method_not_allowed(self, mock_fred_service):
        """Test POST /api/economic-data/{series_id}/ returns 405"""
        url = reverse('economic_indicator_detail', kwargs={'series_id': 'GDP'})
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')

"""
Middleware for MacroDash
Includes: Activity Tracking Middleware
"""

from django.utils.deprecation import MiddlewareMixin
from api.mongodb_service import UserActivityService
import time


class ActivityTrackingMiddleware(MiddlewareMixin):
    """
    Automatically track user activity for API requests

    Tracks:
    - Stock/crypto detail views
    - Search queries
    - API endpoint usage
    - Response times
    """

    def __init__(self, get_response):
        self.get_response = get_response

        # Try to initialize activity service, but don't fail if MongoDB is unavailable
        try:
            self.activity_service = UserActivityService()
        except Exception as e:
            print(f"⚠️ Activity tracking disabled - MongoDB unavailable: {e}")
            self.activity_service = None

        # Actions to track
        self.tracked_endpoints = {
            '/api/stocks/': 'browse_stocks',
            '/api/crypto/': 'browse_crypto',
            '/api/economic-data/': 'view_economic_data',
            '/api/news/': 'view_news',
            '/api/sentiment/': 'view_sentiment',
            '/api/technical-indicators/': 'view_technical_indicators',
            '/api/chat/': 'use_chatbot',
        }

    def process_request(self, request):
        """Mark request start time"""
        request._start_time = time.time()
        return None

    def process_response(self, request, response):
        """Track activity after response is ready"""

        # Skip if MongoDB not available
        if self.activity_service is None or self.activity_service.collection is None:
            return response

        # Only track successful GET requests to API
        if request.method != 'GET' or response.status_code != 200:
            return response

        path = request.path

        # Don't track admin, static files, or non-API requests
        if not path.startswith('/api/') or '/admin/' in path:
            return response

        try:
            # Get user identifier (use session key or IP for anonymous users)
            user_id = self._get_user_id(request)

            # Calculate response time
            response_time = None
            if hasattr(request, '_start_time'):
                response_time = round((time.time() - request._start_time) * 1000, 2)  # ms

            # Determine action type and extract data
            action_data = self._extract_action_data(request, path)

            if action_data:
                # Track the activity
                self.activity_service.track_activity(
                    user_id=user_id,
                    action=action_data['action'],
                    path=path,
                    response_time_ms=response_time,
                    **action_data.get('extra', {})
                )

        except Exception as e:
            # Don't let tracking errors break the request
            print(f"Activity tracking error: {e}")

        return response

    def _get_user_id(self, request):
        """Get user identifier (email, user_id, or session key)"""
        # If user is authenticated (when auth is implemented)
        if hasattr(request, 'user') and request.user.is_authenticated:
            return request.user.email or str(request.user.id)

        # For anonymous users, use session key
        if hasattr(request, 'session'):
            if not request.session.session_key:
                request.session.create()
            return f"anonymous_{request.session.session_key}"

        # Fallback to IP address
        return f"ip_{self._get_client_ip(request)}"

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _extract_action_data(self, request, path):
        """Extract action type and relevant data from request"""

        # Stock detail view: /api/stocks/AAPL/
        if path.startswith('/api/stocks/') and len(path.split('/')) >= 4:
            symbol = path.split('/')[3]
            if symbol and symbol not in ['', 'top', 'browse']:
                return {
                    'action': 'view_stock',
                    'extra': {'symbol': symbol}
                }

        # Crypto detail view: /api/crypto/BTC/
        if path.startswith('/api/crypto/') and len(path.split('/')) >= 4:
            symbol = path.split('/')[3]
            if symbol and symbol not in ['', 'top']:
                return {
                    'action': 'view_crypto',
                    'extra': {'symbol': symbol}
                }

        # Technical indicators: /api/technical-indicators/AAPL/
        if path.startswith('/api/technical-indicators/') and len(path.split('/')) >= 4:
            symbol = path.split('/')[3]
            if symbol:
                return {
                    'action': 'view_technical_indicators',
                    'extra': {
                        'symbol': symbol,
                        'period': request.GET.get('period', '1y')
                    }
                }

        # News view: /api/news/AAPL/
        if path.startswith('/api/news/') and len(path.split('/')) >= 4:
            symbol = path.split('/')[3]
            if symbol:
                return {
                    'action': 'view_news',
                    'extra': {'symbol': symbol}
                }

        # Search query (if you add search endpoint)
        if 'search' in path.lower():
            query = request.GET.get('q') or request.GET.get('query')
            if query:
                return {
                    'action': 'search',
                    'extra': {'query': query}
                }

        # General endpoint tracking
        for endpoint, action in self.tracked_endpoints.items():
            if path.startswith(endpoint):
                return {
                    'action': action,
                    'extra': {}
                }

        return None

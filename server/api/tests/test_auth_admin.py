"""
Unit tests for Authentication and Admin endpoints.
"""
from django.urls import reverse
from django.contrib.auth.models import User
from .base import BaseAPITestCase


class AuthenticationEndpointsTestCase(BaseAPITestCase):
    """Tests for authentication endpoints"""

    def test_register_success(self):
        """Test POST /api/auth/registration/ creates a new user"""
        url = '/api/auth/registration/'
        user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'securepass123',
            'password2': 'securepass123'
        }
        response = self.client.post(
            url,
            data=user_data,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 201)
        # Verify user was created
        user_exists = User.objects.filter(username='newuser').exists()
        self.assertTrue(user_exists)

    def test_register_password_mismatch(self):
        """Test registration with mismatched passwords returns error"""
        url = '/api/auth/registration/'
        user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'securepass123',
            'password2': 'differentpass123'
        }
        response = self.client.post(
            url,
            data=user_data,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)

    def test_register_duplicate_username(self):
        """Test registration with existing username returns error"""
        url = '/api/auth/registration/'
        user_data = {
            'username': 'testuser',  # Already exists from setUp
            'email': 'another@example.com',
            'password1': 'securepass123',
            'password2': 'securepass123'
        }
        response = self.client.post(
            url,
            data=user_data,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)

    def test_register_method_not_allowed(self):
        """Test GET /api/auth/registration/ returns 405"""
        url = '/api/auth/registration/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, 405)

    def test_login_success(self):
        """Test POST /api/auth/login/ logs in user"""
        url = '/api/auth/login/'
        login_data = {
            'email': 'test@example.com',  # dj-rest-auth requires email
            'password': 'testpass123'
        }
        response = self.client.post(
            url,
            data=login_data,
            content_type='application/json'
        )

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertIn('access', data)  # dj-rest-auth with JWT returns 'access' token
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], 'test@example.com')

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 400"""
        url = '/api/auth/login/'
        login_data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(
            url,
            data=login_data,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)  # dj-rest-auth returns 400 for invalid creds

    def test_login_method_not_allowed(self):
        """Test GET /api/auth/login/ returns 405"""
        url = '/api/auth/login/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, 405)

    def test_logout_success(self):
        """Test POST /api/auth/logout/ logs out user"""
        # First login
        self.client.force_login(self.user)

        url = '/api/auth/logout/'
        response = self.client.post(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertIn('detail', data)  # dj-rest-auth returns 'detail' message

    def test_logout_method_not_allowed(self):
        """Test GET /api/auth/logout/ returns 405"""
        url = '/api/auth/logout/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, 405)

    def test_current_user_authenticated(self):
        """Test GET /api/auth/user/ returns current user when authenticated"""
        self.client.force_login(self.user)

        url = '/api/auth/user/'
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertIn('username', data)  # dj-rest-auth returns user object directly
        self.assertEqual(data['username'], 'testuser')

    def test_current_user_unauthenticated(self):
        """Test GET /api/auth/user/ returns 401 when not authenticated"""
        url = '/api/auth/user/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, 401)

    def test_current_user_method_not_allowed(self):
        """Test DELETE /api/auth/user/ returns 405"""
        self.client.force_login(self.user)
        url = '/api/auth/user/'
        response = self.client.delete(url)

        self.assertEqual(response.status_code, 405)


class AdminEndpointsTestCase(BaseAPITestCase):
    """Tests for admin endpoints"""

    def setUp(self):
        """Set up test fixtures including admin user"""
        super().setUp()
        from api.models import UserPreferences
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        # Create UserPreferences with is_admin=True
        UserPreferences.objects.create(
            user=self.admin_user,
            is_admin=True
        )

    def test_admin_users_authenticated_as_admin(self):
        """Test GET /api/admin/users/ returns user list for admin"""
        self.client.force_login(self.admin_user)

        url = reverse('admin_users')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertIn('users', data)
        self.assertTrue(len(data['users']) > 0)

    def test_admin_users_unauthenticated(self):
        """Test GET /api/admin/users/ returns 401 when not authenticated"""
        url = reverse('admin_users')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 401)

    def test_admin_users_authenticated_as_regular_user(self):
        """Test GET /api/admin/users/ returns 403 for non-admin users"""
        self.client.force_login(self.user)

        url = reverse('admin_users')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 403)

    def test_admin_users_method_not_allowed(self):
        """Test POST /api/admin/users/ returns 405"""
        self.client.force_login(self.admin_user)

        url = reverse('admin_users')
        response = self.client.post(url, {})

        # DRF returns 'Method "POST" not allowed.' format
        self.assertEqual(response.status_code, 405)

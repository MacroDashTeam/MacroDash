"""
Unit tests for Authentication and Admin endpoints.
"""
from django.urls import reverse
from django.contrib.auth.models import User
from unittest.mock import patch
from .base import BaseAPITestCase


class AuthenticationEndpointsTestCase(BaseAPITestCase):
    """Tests for authentication endpoints"""

    def test_register_success(self):
        """Test POST /api/auth/register/ creates a new user"""
        url = reverse('register')
        user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'password2': 'securepass123'
        }
        response = self.client.post(
            url,
            data=user_data,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], 'newuser')

        # Verify user was created
        user_exists = User.objects.filter(username='newuser').exists()
        self.assertTrue(user_exists)

    def test_register_password_mismatch(self):
        """Test registration with mismatched passwords returns error"""
        url = reverse('register')
        user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
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
        url = reverse('register')
        user_data = {
            'username': 'testuser',  # Already exists from setUp
            'email': 'another@example.com',
            'password': 'securepass123',
            'password2': 'securepass123'
        }
        response = self.client.post(
            url,
            data=user_data,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)

    def test_register_method_not_allowed(self):
        """Test GET /api/auth/register/ returns 405"""
        url = reverse('register')
        response = self.client.get(url)

        self.assertErrorResponse(response, 405, 'Method not allowed')

    def test_login_success(self):
        """Test POST /api/auth/login/ logs in user"""
        url = reverse('user_login')
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(
            url,
            data=login_data,
            content_type='application/json'
        )

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], 'testuser')

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        url = reverse('user_login')
        login_data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(
            url,
            data=login_data,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 401)

    def test_login_method_not_allowed(self):
        """Test GET /api/auth/login/ returns 405"""
        url = reverse('user_login')
        response = self.client.get(url)

        self.assertErrorResponse(response, 405, 'Method not allowed')

    def test_logout_success(self):
        """Test POST /api/auth/logout/ logs out user"""
        # First login
        self.client.force_login(self.user)

        url = reverse('user_logout')
        response = self.client.post(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertIn('message', data)

    def test_logout_method_not_allowed(self):
        """Test GET /api/auth/logout/ returns 405"""
        url = reverse('user_logout')
        response = self.client.get(url)

        self.assertErrorResponse(response, 405, 'Method not allowed')

    def test_current_user_authenticated(self):
        """Test GET /api/auth/user/ returns current user when authenticated"""
        self.client.force_login(self.user)

        url = reverse('current_user')
        response = self.client.get(url)

        self.assertSuccessResponse(response)
        data = response.json()
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], 'testuser')

    def test_current_user_unauthenticated(self):
        """Test GET /api/auth/user/ returns 401 when not authenticated"""
        url = reverse('current_user')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 401)

    def test_current_user_method_not_allowed(self):
        """Test POST /api/auth/user/ returns 405"""
        url = reverse('current_user')
        response = self.client.post(url, {})

        self.assertErrorResponse(response, 405, 'Method not allowed')


class AdminEndpointsTestCase(BaseAPITestCase):
    """Tests for admin endpoints"""

    def setUp(self):
        """Set up test fixtures including admin user"""
        super().setUp()
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
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

        self.assertErrorResponse(response, 405, 'Method not allowed')

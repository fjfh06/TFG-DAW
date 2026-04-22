import requests
import unittest
import os

# Base URL for the API
BASE_URL = 'http://localhost:5000/api'

class TestAuthAPI(unittest.TestCase):
    def setUp(self):
        self.session = requests.Session()
        self.token = None

    def test_01_login(self):
        """Test login functionality and retrieval of token."""
        print("\nTesting Login...")
        # Assuming default admin created on startup
        response = self.session.post(f'{BASE_URL}/auth/login', json={
            'username': 'shifu', 
            'password': 'admin'
        })
        
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('access_token', data)
        TestAuthAPI.token = data['access_token']
        print("Login successful, token received.")

    def test_02_get_alumnos_secured(self):
        """Test accessing secured endpoint with token."""
        print("\nTesting Secured Endpoint (Get Alumnos)...")
        if not TestAuthAPI.token:
            self.skipTest("No token available")
            
        headers = {'Authorization': f'Bearer {TestAuthAPI.token}'}
        response = self.session.get(f'{BASE_URL}/alumnos/', headers=headers)
        
        if response.status_code != 200:
            print(f"Get Alumnos failed: {response.text}")

        self.assertEqual(response.status_code, 200)
        print("Secured endpoint accessed successfully.")

if __name__ == '__main__':
    # Use TextTestRunner to see output
    unittest.main()

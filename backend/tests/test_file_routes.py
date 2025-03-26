# Tests for the file upload route.
# Covers basic upload functionality and common edge cases.

import unittest
import os
import sys
import io
import json
from unittest.mock import patch
# Add parent directory to path for app imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import create_app
from app.utils.shared_state import SharedState


class FileUploadRouteTests(unittest.TestCase):
    def setUp(self):
        # Initialize test client and reset shared state
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.shared_state = SharedState()
        self.shared_state.active_file = None

    def test_upload_valid_csv_file(self):
        # Testing uploading a valid csv file
        csv_content = "id,name,city\n1,John,London\n2,Jane,New York"
        file_obj = io.BytesIO(csv_content.encode('utf-8'))
        response = self.client.post(
            '/upload',
            data={'file': (file_obj, 'sample.csv')},
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data.get('status'), 'success')
        self.assertIn('filename', response_data)

    def test_upload_invalid_file_type(self):
        # Test uploading with different file
        exe_file = io.BytesIO(b"This is not a CSV or DB")
        response = self.client.post(
            '/upload',
            data={'file': (exe_file, 'malicious.exe')},
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)
        self.assertIn('only', response_data['error'].lower()) 


if __name__ == '__main__':
    unittest.main()
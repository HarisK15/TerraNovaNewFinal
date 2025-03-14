"""
Basic test for the file_routes module.

Tests the file upload functionality which is core to the application.
"""

import unittest
import os
import sys
import io
import json
from unittest.mock import patch

# Add the parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.utils.shared_state import SharedState


class TestFileRoutes(unittest.TestCase):
    """Basic tests for the file upload functionality."""
    
    def setUp(self):
        """Set up the test client."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
        # Reset shared state
        self.shared_state = SharedState()
        self.shared_state.active_file = None
    
    def test_upload_csv_file(self):
        """Test uploading a CSV file."""
        # Create a sample CSV content
        csv_content = "id,name,city\n1,John,London\n2,Jane,New York"
        
        # Create file-like object for the test
        file_obj = io.BytesIO(csv_content.encode('utf-8'))
        
        # Send POST request to upload the CSV file
        response = self.client.post(
            '/upload',
            data={'file': (file_obj, 'test.csv')},
            content_type='multipart/form-data'
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['status'], 'success')
        
        # Check that the shared state was updated
        self.assertIsNotNone(self.shared_state.active_file)


if __name__ == '__main__':
    unittest.main()

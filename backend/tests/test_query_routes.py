"""
Basic test for the query_routes module.

Tests the core query processing functionality.
"""

import unittest
import os
import sys
import json
from unittest.mock import patch
import pandas as pd

# Add the parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.utils.shared_state import SharedState


class TestQueryRoutes(unittest.TestCase):
    """Basic test for the query processing endpoint."""
    
    def setUp(self):
        """Set up test client and mocks."""
        # Create Flask test client
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
        # Reset shared state
        self.shared_state = SharedState()
        self.shared_state.active_file = os.path.join(os.path.dirname(__file__), "test_data.csv")
        
        # Create a test CSV if it doesn't exist
        if not os.path.exists(self.shared_state.active_file):
            pd.DataFrame({
                'id': [1, 2],
                'name': ['John', 'Jane'],
                'city': ['London', 'New York']
            }).to_csv(self.shared_state.active_file, index=False)
    
    def tearDown(self):
        """Clean up test files."""
        if os.path.exists(self.shared_state.active_file):
            os.remove(self.shared_state.active_file)
    
    @patch('app.routes.query_routes.process_query')
    def test_process_query(self, mock_process_query):
        """Test the query processing endpoint."""
        # Mock the query processing function
        mock_process_query.return_value = pd.DataFrame({
            'name': ['John'],
            'city': ['London']
        })
        
        # Make request
        query_data = {
            'query': 'Show me data for London'
        }
        response = self.client.post('/query', data=json.dumps(query_data), 
                                   content_type='application/json')
        
        # Check response
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertIn('results', response_data)
        
        # Verify mock was called
        mock_process_query.assert_called_once()


if __name__ == '__main__':
    unittest.main()

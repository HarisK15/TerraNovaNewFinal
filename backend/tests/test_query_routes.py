# Tests for the /query route
# Covers basic query processing using mocking

import unittest
import os
import sys
import json
from unittest.mock import patch
import pandas as pd

# Add parent directory to sys.path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.utils.shared_state import SharedState


class QueryRouteTests(unittest.TestCase):
    
    def setUp(self):
        # Init Flask
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
        # Set a test file in shared state
        self.shared_state = SharedState()
        self.shared_state.active_file = os.path.join(os.path.dirname(__file__), "test_data.csv")
        
        # Create test CSV 
        if not os.path.exists(self.shared_state.active_file):
            pd.DataFrame({
                'id': [1, 2],
                'name': ['John', 'Jane'],
                'city': ['London', 'New York']
            }).to_csv(self.shared_state.active_file, index=False)
    
    def tearDown(self):
        # Clean up the test CSV
        if os.path.exists(self.shared_state.active_file):
            os.remove(self.shared_state.active_file)
    
    @patch('app.routes.query_routes.process_query')
    def test_query_post_returns_data(self, mock_process_query):
        # Simulate a query result
        mock_process_query.return_value = pd.DataFrame({
            'name': ['John'],
            'city': ['London']
        })

        response = self.client.post(
            '/query',
            data=json.dumps({'query': 'Show me data for London'}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertIn('results', response_data)
        mock_process_query.assert_called_once()


if __name__ == '__main__':
    unittest.main()
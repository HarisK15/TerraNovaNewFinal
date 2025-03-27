# Basic test for the /query route
# Just checks if the route works with mocked query logic

import unittest
import os
import sys
import json
from unittest.mock import patch
import pandas as pd

# So we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.utils.shared_state import SharedState


class TestQueryRoute(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        # Set a test file in shared state
        self.shared_state = SharedState()
        self.shared_state.active_file = os.path.join(os.path.dirname(__file__), "test_data.csv")
        if not os.path.exists(self.shared_state.active_file):
            pd.DataFrame({
                'id': [1, 2],
                'name': ['John', 'Jane'],
                'city': ['London', 'New York']
            }).to_csv(self.shared_state.active_file, index=False)
    
    def tearDown(self):
        # Remove test CSV
        if os.path.exists(self.shared_state.active_file):
            os.remove(self.shared_state.active_file)
    
    @patch('app.routes.query_routes.handle_query')
    def test_query_post_returns_results(self, mock_handle_query):
        # Return mock DF
        mock_handle_query.return_value = pd.DataFrame({
            'name': ['John'],
            'city': ['London']
        })

        # fake request
        response = self.client.post(
            '/query',
            data=json.dumps({'query': 'Show me data for London'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertIn('results', response_data)
        mock_handle_query.assert_called_once()


if __name__ == '__main__':
    unittest.main()
# testing that SharedState is actually a singleton

import unittest
import os
import sys

# So we can import the app module properly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.shared_state import SharedState


class SharedStateTests(unittest.TestCase):

    def setUp(self):
        # Clear the active_file before each test
        self.shared_state = SharedState()
        self.shared_state.active_file = None

    def test_singleton_behavior(self):
        # Check that two instances reflect the same shared state
        a = SharedState()
        b = SharedState()
        a.active_file = "mock_data.csv"
        self.assertEqual(b.active_file, "mock_data.csv")


if __name__ == '__main__':
    unittest.main()
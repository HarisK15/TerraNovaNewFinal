# Tests for the SharedState singleton behavior

import unittest
import os
import sys

# import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.shared_state import SharedState


class SharedStateTests(unittest.TestCase):

    def setUp(self):
        # Clear the active_file before each test
        self.shared_state = SharedState()
        self.shared_state.active_file = None

    def test_singleton_behavior(self):
        # Make sure all instances share the same state
        a = SharedState()
        b = SharedState()

        a.active_file = "mock_data.csv"
        self.assertEqual(b.active_file, "mock_data.csv")


if __name__ == '__main__':
    unittest.main()
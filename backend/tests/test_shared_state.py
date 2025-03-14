"""
Basic test for the shared_state module.

Tests the singleton pattern implementation for maintaining state between routes.
"""

import unittest
import os
import sys

# Add the parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.shared_state import SharedState


class TestSharedState(unittest.TestCase):
    """Basic test for the SharedState singleton."""
    
    def setUp(self):
        """Reset the SharedState before the test."""
        self.shared_state = SharedState()
        self.shared_state.active_file = None
    
    def test_singleton_pattern(self):
        """Test that multiple instances reference the same state."""
        # Create two instances
        instance1 = SharedState()
        instance2 = SharedState()
        
        # Set a value in one instance
        instance1.active_file = "test_file.csv"
        
        # Verify it's accessible from the other instance
        self.assertEqual(instance2.active_file, "test_file.csv")


if __name__ == '__main__':
    unittest.main()

# shared_state.py
# This module provides shared state variables that can be imported by multiple route files

class SharedState:
    """A simple class to hold shared state across different modules"""
    def __init__(self):
        self.active_file = None

# Create a singleton instance
shared_state = SharedState()

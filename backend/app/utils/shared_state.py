# shared_state.py
# This module provides shared state variables that can be imported by multiple route files

class SharedState:
    """A singleton class to hold shared state across different modules.
    
    This implementation ensures that all imports and instantiations
    of SharedState return the same instance, maintaining shared state
    between route files for file handling and query processing.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SharedState, cls).__new__(cls)
            # Initialize default state
            cls._instance.active_file = None
            cls._instance.active_db = None
            cls._instance.active_dataframe = None
        return cls._instance

# You can import the shared_state instance directly:
# from app.utils.shared_state import shared_state
shared_state = SharedState()

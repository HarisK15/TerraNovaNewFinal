# This file provides shared state variables that can be imported by multiple route files

class SharedState:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SharedState, cls).__new__(cls)
            # Initialize default state
            cls._instance.active_file = None
            cls._instance.active_db = None
            cls._instance.active_dataframe = None
        return cls._instance
shared_state = SharedState()

"""
Basic tests for the query_executor module.

Tests the core functionality of SQL and Pandas query execution.
"""

import unittest
import os
import sys
import pandas as pd
import sqlite3

# Add the parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.query_executor import execute_sql_query, execute_pandas_query


class TestQueryExecutor(unittest.TestCase):
    """Basic tests for the query_executor functions."""
    
    def setUp(self):
        """Set up test data."""
        # Create a test database for SQL queries
        self.db_path = os.path.join(os.path.dirname(__file__), "test_database.db")
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY,
            name TEXT,
            city TEXT
        )
        """)
        
        test_data = [
            (1, "John", "London"),
            (2, "Jane", "New York")
        ]
        cursor.executemany(
            "INSERT OR REPLACE INTO employees (id, name, city) VALUES (?, ?, ?)",
            test_data
        )
        conn.commit()
        conn.close()
        
        # Create a test DataFrame for Pandas queries
        self.df = pd.DataFrame({
            'name': ['John', 'Jane'],
            'city': ['London', 'New York']
        })
    
    def tearDown(self):
        """Clean up test database."""
        if os.path.exists(self.db_path):
            os.remove(self.db_path)
    
    def test_execute_sql_query(self):
        """Test basic SQL query execution."""
        query = "SELECT * FROM employees WHERE city = 'London'"
        results = execute_sql_query(query, self.db_path)
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "John")
    
    def test_execute_pandas_query(self):
        """Test basic Pandas query execution."""
        query = "df[df['city'] == 'London']"
        result = execute_pandas_query(query, self.df)
        
        self.assertEqual(len(result), 1)
        self.assertEqual(result.iloc[0]['name'], "John")


if __name__ == '__main__':
    unittest.main()

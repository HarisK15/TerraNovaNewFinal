# Tests for the SQL and Pandas query execution functions

import unittest
import os
import sys
import pandas as pd
import sqlite3

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.query_executor import execute_sql_query, execute_pandas_query


class QueryExecutorTests(unittest.TestCase):
    
    def setUp(self):
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
        cursor.executemany(
            "INSERT OR REPLACE INTO employees (id, name, city) VALUES (?, ?, ?)",
            [(1, "John", "London"), (2, "Jane", "New York")]
        )
        conn.commit()
        conn.close()
        
        self.df = pd.DataFrame({
            'name': ['John', 'Jane'],
            'city': ['London', 'New York']
        })
    
    def tearDown(self):
        # Clean up test DB
        if os.path.exists(self.db_path):
            os.remove(self.db_path)
    
    def test_sql_query_runs(self):
        query = "SELECT * FROM employees WHERE city = 'London'"
        results = execute_sql_query(query, self.db_path)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "John")
    
    def test_pandas_query_runs(self):
        query = "df[df['city'] == 'London']"
        result = execute_pandas_query(query, self.df)
        self.assertEqual(len(result), 1)
        self.assertEqual(result.iloc[0]['name'], "John")


if __name__ == '__main__':
    unittest.main()
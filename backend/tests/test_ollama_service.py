# Basic tests for the Ollama response cleaner

import unittest
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.ollama_service import clean_response

class TestCleanResponse(unittest.TestCase):

    def setUp(self):
        # Setup mock 
        self.new_format = {
            "model": "llama3",
            "message": {
                "content": "```python\ndf[df['city'] == 'London']\n```",
                "role": "assistant"
            }
        }
        self.old_format = {
            "model": "llama3",
            "response": "```python\ndf[df['city'] == 'London']\n```"
        }

    def test_new_response_format(self):
        # Should extract from the 'message' field
        cleaned = clean_response(self.new_format)
        self.assertEqual(cleaned, "df[df['city'] == 'London']")

    def test_old_response_format(self):
        # Should extract from the 'response' field
        cleaned = clean_response(self.old_format)
        self.assertEqual(cleaned, "df[df['city'] == 'London']")

    def test_empty_response(self):
        # Should return an empty string if nothing useful is found
        cleaned = clean_response({})
        self.assertEqual(cleaned, "")


if __name__ == '__main__':
    unittest.main()
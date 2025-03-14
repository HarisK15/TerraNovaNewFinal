"""
Basic test for the ollama_service module.

Tests the response cleaning functionality for the Ollama API integration.
"""

import unittest
import os
import sys

# Add the parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ollama_service import clean_response


class TestOllamaService(unittest.TestCase):
    """Basic tests for the Ollama service response handling."""
    
    def setUp(self):
        """Set up tests with mock Ollama responses."""
        # Mock response with the new message format
        self.mock_ollama_response_with_message = {
            "model": "llama3",
            "message": {
                "content": "```python\ndf[df['city'] == 'London']\n```",
                "role": "assistant"
            }
        }
        
        # Mock response with the old format
        self.mock_ollama_response_old_format = {
            "model": "llama3",
            "response": "```python\ndf[df['city'] == 'London']\n```"
        }
    
    def test_clean_response_new_format(self):
        """Test cleaning a response with the new message format."""
        cleaned = clean_response(self.mock_ollama_response_with_message)
        self.assertEqual(cleaned, "df[df['city'] == 'London']")
    
    def test_clean_response_old_format(self):
        """Test cleaning a response with the old format."""
        cleaned = clean_response(self.mock_ollama_response_old_format)
        self.assertEqual(cleaned, "df[df['city'] == 'London']")


if __name__ == '__main__':
    unittest.main()

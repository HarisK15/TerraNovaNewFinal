import os
import sys

# ✅ Ensure Python can find `app/`
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.services.langchain_service import initialize_langchain_service, generate_sql_query
from app.services.query_executor import execute_sql_query

# ✅ Debugging the Working Directory
print(f"✅ DEBUG: Current Working Directory: {os.getcwd()}")

# ✅ Ensure `db_path` is Correct
db_path = os.path.abspath("backend/uploads/test.db")
print(f"✅ DEBUG: Final Absolute `db_path`: {db_path}")

# ✅ Ensure LLM Model is initialized
llm_model = initialize_langchain_service()

test_query = "Show all employees in new york city who earn more than 50000"

sql_query = generate_sql_query(test_query, llm_model, db_path)
print("✅ DEBUG: AI-Generated SQL Query:", sql_query)

query_results = execute_sql_query(sql_query, db_path)
print("✅ DEBUG: Final Query Results:", query_results)
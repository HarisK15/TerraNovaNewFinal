# 📌 Uses LangChain to refine AI-generated queries.
# 🔗 Connected to:
# 	•	ollama_service.py (Enhances AI responses)
# 	•	query_routes.py (Processes user queries)
#
# ✅ Features to Implement:
# 	•	Improve AI-generated queries using LangChain’s text processing
# 	•	Ensure queries follow database schema rules
# 	# •	Fix AI hallucinations before execution

from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
import re
from llama_index.llms.ollama import Ollama
import ollama
from langchain_core.messages import AIMessage
from langchain.chains import LLMChain
from langchain.schema.runnable import RunnableLambda
from app.utils.db_handler import get_database_schema






def initialize_langchain_service():
    csv_llm = ChatOllama(model="llama3")
    sql_llm = ChatOllama(model="llama3")

    return{"csv":csv_llm, "sql":sql_llm}



def generate_sql_query(user_input, llm_model, db_path):
    sql_llm = llm_model["sql"]
    schema = get_database_schema(db_path)
    print(f"✅ DEBUG: Extracted Schema: {schema}")
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", f"""
            You are an SQL query generator. Your ONLY job is to return a valid SQL query based on the user question.

        ⚠️ STRICT RULES ⚠️:
        - DO NOT provide explanations.
        - DO NOT repeat the question.
        - DO NOT use words like "Here is an example query."
        - DO NOT include any text before or after the SQL.
        - The query MUST be **inside triple backticks** like this: ```sql ... ```
        - Always use `LOWER(column_name) = LOWER('value')` for text comparisons to ensure case-insensitive matching.
        - Always generate SQL queries that match actual database values.
        
        ✅ **Example 1**:
        User: "Show all employees earning more than $50,000"
        Response:
        ```sql
        SELECT * FROM employees WHERE salary > 50000;
        ```

        ✅ **Example 2**:
        User: "Find customers from New York"
        Response:
        ```sql
        SELECT * FROM customers WHERE city = 'New York';
        ```

        Now, generate an SQL query for the following user input.

        🚨 **IMPORTANT: Your response MUST follow the format EXACTLY. Do NOT include anything else.**
        - Do NOT modify column names or invent new values.
        - Ensure all generated queries match the exact city names in the database.

        
        

        """),
        ("human", "{question}")  # ✅ Dynamically injects user question
    ])

    chain = prompt_template | sql_llm
    ai_response = chain.invoke({"question": user_input})

    if hasattr(ai_response, "content"):
        ai_text = ai_response.content.strip()
    else:
        ai_text = str(ai_response).strip()

    sql_query = ai_text.replace("```sql", "").replace("```", "").strip()
    return sql_query




def generate_pandas_query(user_input, llm_model):
    csv_llm = llm_model["csv"]

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """
        You are a Pandas DataFrame query generator. Your ONLY job is to return a structured query.

        ⚠️ STRICT RULES ⚠️:
        - DO NOT provide explanations.
        - DO NOT repeat the question.
        - The output must be a **single valid Pandas query**.
        - The query MUST use `df[...]` as the format.
        - The query MUST end with a `]`.
        - The response MUST NOT contain triple backticks (```) or explanations.

        ✅ **Example 1**:
        User: "Find all students who scored more than 80."
        Response:
        ```python
        df[df['mark'] > 80]
        ```

        ✅ **Example 2**:
        User: "Show all employees who are managers"
        Response:
        ```python
        df[df['position'] == 'Manager']
        ```

        Now, generate a Pandas query for:
        """),
        ("human", "{question}")
    ])

    chain = prompt_template | csv_llm
    ai_response = chain.invoke({"question": user_input})

    # ✅ Extract text content from AIMessage
    if hasattr(ai_response, "content"):
        ai_text = ai_response.content.strip()
    else:
        ai_text = str(ai_response).strip()

    # ✅ Apply regex to extract only the Pandas query
    match = re.search(r"df$begin:math:display$.*?$end:math:display$", ai_text)  # ✅ Matches `df[...]`

    if match:
        pandas_query = match.group(0).strip()  # ✅ Extract valid query
    else:
        pandas_query = ai_text.strip()  # ✅ Fallback to full AI response

    # ✅ Ensure AI does not output incomplete expressions
    if not pandas_query.endswith("]"):
        pandas_query += "]"  # ✅ Adds closing bracket if missing

    return pandas_query


if __name__ == "__main__":
    llm_models = initialize_langchain_service()  # ✅ Load LLMs

    test_query = "Get the average salary per department, but only for departments with at least 5 employees"
    generated_sql = generate_pandas_query(test_query, llm_models)

    print("Generated SQL Query:", generated_sql)
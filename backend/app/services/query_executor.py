import sqlite3
import pandas as pd
import re
from langchain_core.messages import AIMessage
from langchain.schema.runnable import RunnableLambda
from app.services.langchain_service import generate_sql_query, generate_pandas_query
from app.utils.shared_state import SharedState 
import logging

logger = logging.getLogger(__name__)

def execute_sql_query(query, db_path):
    """Execute an SQL query against a SQLite database file."""
    abs_db_path = os.path.abspath(db_path) 
    logger.info(f"Using database: {abs_db_path}")

    if not os.path.exists(abs_db_path):
        return f"Database file not found at {abs_db_path}"

    conn = sqlite3.connect(abs_db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    logger.info(f"Executing SQL Query -> {query.strip()}")
    cursor.execute(query.strip())
    results = cursor.fetchall()
    conn.close()

    if results:
        return [dict(row) for row in results]
    else:
        return "No matching records found."

def execute_pandas_query(query, df):
    """Execute a Pandas query on a DataFrame."""
    try:
        # Handle simple count queries that don't return DFs
        if query.strip() in ['len(df)', 'df.shape[0]']:
            count = len(df)
            return pd.DataFrame({"Total Count": [count]})
        
        # Handle other functions that return scalar values
        if any(agg_func in query for agg_func in ['.mean()', '.sum()', '.min()', '.max()', '.count()']):
            result_df = eval(query, {"df": df})
            if not isinstance(result_df, pd.DataFrame):
                # Convert result to DF
                agg_type = 'Value'
                if '.mean()' in query:
                    agg_type = 'Average'
                elif '.sum()' in query:
                    agg_type = 'Sum'
                elif '.min()' in query:
                    agg_type = 'Minimum'
                elif '.max()' in query:
                    agg_type = 'Maximum'
                elif '.count()' in query:
                    agg_type = 'Count'
                
                # Extract column name if present in query
                col_match = re.search(r"df\['([^']+)'\]", query)
                if col_match:
                    col_name = col_match.group(1)
                    return pd.DataFrame({f"{agg_type} of {col_name}": [result_df]})
                else:
                    return pd.DataFrame({agg_type: [result_df]})
        
        # Regular query execution
        result_df = eval(query, {"df": df})
        if isinstance(result_df, pd.DataFrame):
            return result_df
        else:
            return pd.DataFrame({"Result": [result_df]})
    except Exception as e:
        error_message = str(e)
        logger.error(f"Error executing Pandas query: {error_message}")
        
        # More helpful error message for common issues
        if "No group keys passed" in error_message:
            return pd.DataFrame({"Error": ["Invalid groupby operation. For simple count queries, use len(df) instead."]})
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})

def process_query(user_query, llm_model, db_path=None, df=None):
    """Process a natural language query to generate and execute either an SQL or Pandas query."""
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"

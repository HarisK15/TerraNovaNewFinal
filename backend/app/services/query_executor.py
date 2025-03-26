import sqlite3
import pandas as pd
import re
from langchain_core.messages import AIMessage
from langchain.schema.runnable import RunnableLambda
from app.services.langchain_service import generate_sql_query, generate_pandas_query
from app.utils.shared_state import SharedState 
import logging
import os

logging.basicConfig(
    level=logging.DEBUG, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def run_sql_query(query, db_path):
    abs_db_path = os.path.abspath(db_path) 
    logger.info(f"running SQL on -> {abs_db_path}")
    if not os.path.exists(abs_db_path):
        return f"Database file not found at {abs_db_path}"
    
    conn = sqlite3.connect(abs_db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    logger.info(f" query -> {query.strip()}")
    cursor.execute(query.strip())
    results = cursor.fetchall()
    conn.close()

    return [dict(row) for row in results] if results else []

def run_pandas_query(query, df):
    try:
        # Handle simple count queries that don't return DFs
        if query.strip() in ['len(df)', 'df.shape[0]']:
            count = len(df)
            return pd.DataFrame({"Total Count": [count]})
        
        # Handle other functions that return scalar values
        if any(agg_func in query for agg_func in ['.mean()', '.sum()', '.min()', '.max()', '.count()']):
            result = eval(query, {"df": df})
            if not isinstance(result, pd.DataFrame):
                label = 'Value'
                if '.mean()' in query:
                    label = 'Average'
                elif '.sum()' in query:
                    label = 'Sum'
                elif '.min()' in query:
                    label = 'Minimum'
                elif '.max()' in query:
                    label = 'Maximum'
                elif '.count()' in query:
                    label = 'Count'
                
                col_name = None
                start = query.find("df['")
                end = query.find("']", start)

                if start != -1 and end != -1:
                    col_name = query[start + 4:end]
                    return pd.DataFrame({f"{label} of {col_name}": [result]})
                else:
                    return pd.DataFrame({label: [result]})
        result = eval(query, {"df": df})
        if isinstance(result, pd.DataFrame):
            return result
        return pd.DataFrame({"Result": [result]})
    except Exception as e:
        error_message = str(e)
        logger.error(f"Error executing Pandas query: {error_message}")
        
        if "No group keys passed" in error_message:
            return pd.DataFrame({"Error": ["Invalid groupby operation. For simple count queries, use len(df) instead."]})
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})

# Takes a natural language query and runs it as either SQL or Pandas
def handle_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return run_sql_query(sql_query, db_path)
        elif df is not None:
            pandas_query = generate_pandas_query(user_query, llm_model)
            return run_pandas_query(pandas_query, df)
        else:
            return "Error: No query provided"
    except Exception as e:
        logger.exception("Something went wrong")
        return "Query processing failed."
        
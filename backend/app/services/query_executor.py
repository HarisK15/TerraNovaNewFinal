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

# Helper function to preprocess pandas code to safely handle dates
def preprocess_pandas_code(code, df_columns):
    potential_date_cols = [col for col in df_columns if any(date_term in col.lower() for date_term in 
                          ['date', 'time', 'timestamp', 'delivery', 'purchase', 'approved', 'estimated'])]
    for col in potential_date_cols:
        # Replace patterns like: df['col'] - df['col'] or df.col - df.col
        # With: pd.to_datetime(df['col'], errors='coerce') - pd.to_datetime(df['col'], errors='coerce')
        col_pattern = f"df\\[[\'\\\"]({col})[\'\\\"]\\]"
        col_replacement = f"pd.to_datetime(df[\'\\1\'], errors='coerce')"

        operation_pattern = f"({col_pattern}\\s*[-+]\\s*{col_pattern})"

        matches = re.findall(operation_pattern, code)
        if matches:
            for match in matches:
                fixed_expr = re.sub(col_pattern, col_replacement, match)
                code = code.replace(match, fixed_expr)
        
        # Handle .dt accessor usage (impelemented mainly for dforders.csv)
        dt_pattern = f"{col_pattern}\\.dt"
        dt_matches = re.findall(dt_pattern, code)
        for match in dt_matches:
            original = f"df['{match}'].dt"
            replacement = f"pd.to_datetime(df['{match}'], errors='coerce').dt"
            code = code.replace(original, replacement)
    
    # regex matching to check for specific order ID time difference calculations
    if re.search(r"df\[(df\['order_id'\]\s*==\s*['\"][^'\"]+['\"]\)\s*,\s*\(['\"]order_.*timestamp['\"]", code) or "order_id" in code and any(term in code for term in ["difference", "days between"]):
        logger.info("Detected specific order query with timestamps, applying safe template")
        order_id_match = re.search(r"df\['order_id'\]\s*==\s*['\"]([^'\"]+)['\"]", code)
        if order_id_match:
            order_id = order_id_match.group(1)
            replacement = """(lambda: 
    try:
        order_id = '%s'
        order_rows = df[df['order_id'] == order_id]
        if len(order_rows) == 0:
            return "Order not found"
        
        purchase_str = order_rows['order_purchase_timestamp'].iloc[0]
        delivery_str = order_rows['order_delivered_timestamp'].iloc[0]
        
        purchase_date = pd.to_datetime(purchase_str, errors='coerce')
        delivery_date = pd.to_datetime(delivery_str, errors='coerce')
        
        if pd.isna(purchase_date) or pd.isna(delivery_date):
            return "Missing purchase or delivery date"
        
        # Calculate difference as integer days
        diff = delivery_date - purchase_date
        return diff.days
    except Exception as e:
        return f"Error calculating date difference: {str(e)}"
)()""" % order_id
            
            logger.info(f"Applied safer order time difference template for order {order_id}")
            return replacement
    
    # Fix common query patterns with datetime operations
    # Average time between timestamps pattern
    if "mean()" in code and any(f"'{col}'" in code for col in potential_date_cols):
        timestamp_diff_pattern = r"\(df\[['\"](.*?)timestamp['\"]\].*-.*df\[['\"](.*?)timestamp['\"]\]\).*\.mean\(\)"
        if re.search(timestamp_diff_pattern, code):
            logger.info("Detected timestamp difference with mean calculation")
            code = """(lambda: 
    try:
        # Convert timestamps to datetime 
        df['dt1'] = pd.to_datetime(df['order_delivered_timestamp'], errors='coerce')
        df['dt2'] = pd.to_datetime(df['order_purchase_timestamp'], errors='coerce')
        
        # Filter rows where both dates are valid
        df_valid = df.dropna(subset=['dt1', 'dt2'])
        
        if len(df_valid) == 0:
            return "No valid date pairs found"
            
        # Calculate the difference between each pair and convert to days
        df_valid['days_diff'] = (df_valid['dt1'] - df_valid['dt2']).apply(lambda x: x.days)
        
        # Return the mean
        return df_valid['days_diff'].mean()
    except Exception as e:
        return f"Error calculating average time difference: {str(e)}"
)()"""
    
    logger.info(f"original code: {code}")
    
    # Extra check for .dt.days that causes errors
    if ".dt.days" in code:
        logger.warning("Potential problem: .dt.days found in code!")
        dt_days_pattern = r"(.*?)\s*\.\s*dt\s*\.\s*days"
        dt_days_matches = re.findall(dt_days_pattern, code)
        
        if dt_days_matches:
            for match in dt_days_matches:
                logger.info(f"Found problematic .dt.days on: {match}")
                original = f"{match}.dt.days"
                # Check if part of a vector
                if "iloc" in match or "[0]" in match:
                    replacement = f"({match}).days"
                else:
                    replacement = f"({match}).apply(lambda x: x.days)"
                
                code = code.replace(original, replacement)
                logger.info(f"Fixed .dt.days issue: {original} -> {replacement}")
    
    dt_accessor_pattern = r"df\[['\"](.*?)['\"]\]\.dt"
    dt_matches = re.findall(dt_accessor_pattern, code)
    for col in dt_matches:
        original = f"df['{col}'].dt"
        replacement = f"pd.to_datetime(df['{col}'], errors='coerce').dt"
        code = code.replace(original, replacement)
    
    return code


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
        preprocessed_query = preprocess_pandas_code(query, df.columns)
        logger.info(f"Original query: {query}")
        logger.info(f"Preprocessed query: {preprocessed_query}")
        
        # Handle simple count queries that don't return DFs
        if preprocessed_query.strip() in ['len(df)', 'df.shape[0]']:
            count = len(df)
            return pd.DataFrame({"Total Count": [count]})
        
        # Handle list-like results (e.g "which product ids are toys")
        if "df[" in preprocessed_query and (
            "product_id" in preprocessed_query or 
            "product_category" in preprocessed_query or
            preprocessed_query.count("==") > 0 and "contains" in preprocessed_query.lower()
        ):
            # mkae it as a table
            result = eval(preprocessed_query, {"df": df, "pd": pd})
            if isinstance(result, pd.Series):
                return result
            elif isinstance(result, list) or hasattr(result, '__iter__') and not isinstance(result, (str, dict, pd.DataFrame)):
                column_name = "product_id" if "product_id" in preprocessed_query else "item"
                return pd.DataFrame({column_name: result})
        
        # Handle other functions that return scalar values
        if any(agg_func in preprocessed_query for agg_func in ['.mean()', '.sum()', '.min()', '.max()', '.count()']):
            result = eval(preprocessed_query, {"df": df, "pd": pd})
            if not isinstance(result, pd.DataFrame):
                label = 'Value'
                if '.mean()' in preprocessed_query:
                    label = 'Average'
                elif '.sum()' in preprocessed_query:
                    label = 'Sum'
                elif '.min()' in preprocessed_query:
                    label = 'Minimum'
                elif '.max()' in preprocessed_query:
                    label = 'Maximum'
                elif '.count()' in preprocessed_query:
                    label = 'Count'
                
                col_name = None
                start = preprocessed_query.find("df['")
                end = preprocessed_query.find("']", start)

                if start != -1 and end != -1:
                    col_name = preprocessed_query[start + 4:end]
                    return pd.DataFrame({f"{label} of {col_name}": [result]})
                else:
                    return pd.DataFrame({label: [result]})
        result = eval(preprocessed_query, {"df": df, "pd": pd})
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
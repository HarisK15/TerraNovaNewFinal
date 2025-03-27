import sqlite3
import os
import pandas as pd
import json
import re
import numpy as np
import logging
import functools

logging.basicConfig(
    level=logging.DEBUG, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def handle_exceptions(return_error_dict=True):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                error_msg = str(e)
                logger.info(f"Error in {func.__name__}: {error_msg}")
                if return_error_dict:
                    return {"success": False, "error": error_msg}
                else:
                    return {"error": f"Error processing file: {error_msg}"}
        return wrapper
    return decorator

@handle_exceptions(return_error_dict=False)
def get_database_schema(file_path):
    abs_file_path = os.path.abspath(file_path)  
    logger.info(f"Checking file at {abs_file_path}")
    file_extension = os.path.splitext(abs_file_path)[1].lower()
    schema = {}
    
    if file_extension == '.db':
        import sqlite3
        conn = sqlite3.connect(abs_file_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        logger.info(f"Following Tables found: {tables}")
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            columns = [row[1] for row in cursor.fetchall()]
            schema[table] = columns
            logger.info(f"Columns in {table}: {columns}")
        conn.close()
        
        # Format schema information
        schema_text = "Database Schema:\n"
        for table, cols in schema.items():
            schema_text += f"Table: {table}\n"
            schema_text += f"Columns: {', '.join(cols)}\n\n"
        
        return schema_text
    else:  # CSV file
        try:
            df = pd.read_csv(abs_file_path)
            columns = df.columns.tolist()
            logger.info(f"CSV columns: {columns}")
            
            # Basic schema info
            schema_text = "Database Schema:\n"
            schema_text += f"Table: data\n"
            schema_text += f"Columns: {', '.join(columns)}\n"
            schema_text += f"Row count: {len(df)}\n\n"
            
            return schema_text
        except Exception as e:
            logger.exception(f"Error reading CSV file: {str(e)}")
            return f"Error: Could not read CSV file - {str(e)}"

@handle_exceptions(return_error_dict=False)
def get_enhanced_schema_with_samples(file_path, sample_rows=5):
    """Get schema and sample data for RAG"""
    abs_file_path = os.path.abspath(file_path)
    file_extension = os.path.splitext(abs_file_path)[1].lower()
    
    # Get basic schema
    schema_text = get_database_schema(file_path)
    
    # Add sample data
    if file_extension == '.db':
        import sqlite3
        conn = sqlite3.connect(abs_file_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        sample_text = "Sample Data:\n"
        for table in tables:
            cursor.execute(f"SELECT * FROM {table} LIMIT {sample_rows};")
            rows = cursor.fetchall()
            
            # Get column names
            cursor.execute(f"PRAGMA table_info({table});")
            columns = [row[1] for row in cursor.fetchall()]
            
            sample_text += f"Table: {table}\n"
            # Create a simple tabular representation
            sample_text += " | ".join(columns) + "\n"
            sample_text += "-" * (sum(len(col) for col in columns) + 3 * (len(columns) - 1)) + "\n"
            
            for row in rows:
                sample_text += " | ".join(str(val) for val in row) + "\n"
            
            sample_text += "\n"
        
        conn.close()
        return schema_text + "\n" + sample_text
    else:  # CSV file
        try:
            df = pd.read_csv(abs_file_path)
            
            # Add column statistics to help LLM understand data distribution
            stats_text = "Column Statistics:\n"
            for col in df.columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    stats_text += f"{col}: min={df[col].min()}, max={df[col].max()}, avg={df[col].mean():.2f}\n"
                else:
                    # For string columns, show unique value count
                    unique_vals = df[col].nunique()
                    stats_text += f"{col}: {unique_vals} unique values\n"
                    # If few unique values, show them
                    if unique_vals <= 10:
                        stats_text += f"  Values: {', '.join([str(x) for x in df[col].unique()[:10]])}\n"
            
            # Sample data
            sample_text = "\nSample Data (first 5 rows):\n"
            sample_df = df.head(sample_rows)
            
            # Convert to a simple string table
            headers = sample_df.columns.tolist()
            header_row = " | ".join(headers)
            separator = "-" * len(header_row)
            
            sample_text += header_row + "\n"
            sample_text += separator + "\n"
            
            for _, row in sample_df.iterrows():
                sample_text += " | ".join([str(row[col])[:20] for col in headers]) + "\n"
            
            return schema_text + "\n" + stats_text + "\n" + sample_text
        except Exception as e:
            logger.exception(f"Error getting enhanced schema: {str(e)}")
            return schema_text + f"\nError getting sample data: {str(e)}"

@handle_exceptions()
def execute_pandas_query(file_path, pandas_code):
    abs_file_path = os.path.abspath(file_path)
    if not os.path.exists(abs_file_path):
        return {"success": False, "error": f"File not found: {file_path}"}
    
    file_extension = os.path.splitext(abs_file_path)[1].lower()
    if file_extension != '.csv':
        return {"success": False, "error": "This operation is only supported for CSV files"}
    
    df = pd.read_csv(abs_file_path)
    logger.info(f"DataFrame shape: {df.shape}")
    
    # Handle special case for simple column selection
    column_selection_pattern = r"df\[\[(.+)\]\]"
    match = re.search(column_selection_pattern, pandas_code)
    if match:
        columns_str = match.group(1)
        
        try:
            requested_columns = []
            for col_str in columns_str.split(','):
                clean_col = col_str.strip().strip("'").strip('"')
                requested_columns.append(clean_col)

            valid_columns = [col for col in requested_columns if col in df.columns]
            logger.info(f"Valid columns found in DataFrame: {valid_columns}")
            
            if valid_columns:
                result_df = df[valid_columns]
                logger.info(f"Successfully selected columns: {valid_columns}")
                return {
                    "success": True,
                    "results": result_df.to_dict(orient='records'),
                    "columns": valid_columns
                }
            else:
                logger.info("No valid columns found in DataFrame")
                return {
                    "success": False,
                    "error": f"None of the requested columns {requested_columns} were found in the DataFrame. Available columns are: {df.columns.tolist()}"
                }
        except Exception as column_error:
            logger.info(f"Error processing column selection: {str(column_error)}")
    
    print(f"Running pandas code: {pandas_code[:100]}...")

    # Create locals dictionary with the DataFrame
    locals_dict = {'df': df, 'result': None}
    exec(f"result = {pandas_code}", {'pd': pd, 'np': np, '__builtins__': {}}, locals_dict)
    
    if isinstance(locals_dict['result'], pd.DataFrame) and len(locals_dict['result'].columns) == 2 and locals_dict['result'].columns.duplicated().any():
        locals_dict['result'].columns = ["value", "count"]
    if isinstance(locals_dict['result'], pd.DataFrame):
        if any(locals_dict['result'].columns.duplicated()):
            # Rename duplicate columns by adding a number suffix
            cols = list(locals_dict['result'].columns)
            for i, col in enumerate(cols):
                count = cols[:i].count(col)
                if count > 0:
                    cols[i] = f"{col}_{count}"
            locals_dict['result'].columns = cols
        
        results_dict = locals_dict['result'].to_dict(orient='records')
        return {
            "success": True,
            "results": results_dict,
            "columns": locals_dict['result'].columns.tolist()
        }
    elif isinstance(locals_dict['result'], pd.Series):
        # Convert Series to DataFrame
        result_df = locals_dict['result'].reset_index()
        
        # If index has no name, give it a default
        if result_df.columns[0] == 'index':
            result_df.columns = ['key', 'value']
        
        results_dict = result_df.to_dict(orient='records')
        
        return {
            "success": True,
            "results": results_dict,
            "columns": result_df.columns.tolist()
        }
    else:
        # Handle scalar or other types
        return {
            "success": True,
            "results": [{"result": locals_dict['result']}],
            "columns": ["result"]
        }

@handle_exceptions()
def execute_query(file_path, sql_query):
    abs_file_path = os.path.abspath(file_path)
    file_extension = os.path.splitext(abs_file_path)[1].lower()
    
    if file_extension == '.db':
        conn = sqlite3.connect(abs_file_path)
        results = pd.read_sql_query(sql_query, conn)
        conn.close()
        
        return {
            "success": True,
            "results": results.to_dict(orient="records"),
            "columns": results.columns.tolist()
        }
        
    elif file_extension == '.csv':
        df = pd.read_csv(abs_file_path)
        logger.info(f"CSV DataFrame columns: {df.columns.tolist()}")
        logger.info(f"CSV DataFrame sample data:\n{df.head(3)}")
        
        # Create temporary in-memory SQLite database
        conn = sqlite3.connect(":memory:")
        table_name = 'data'
        df.to_sql(table_name, conn, index=False, if_exists="replace")
        
        # Execute the query
        try:
            logger.info(f"Executing SQL Query: {sql_query}")
            results = pd.read_sql_query(sql_query, conn)
            logger.info(f"Query results shape: {results.shape}")
        finally:
            conn.close()
        
        return {
            "success": True,
            "results": results.to_dict(orient="records"),
            "columns": results.columns.tolist()
        }
    else:
        return {
            "success": False,
            "error": f"Unsupported file format: {file_extension}"
        }

def format_results(results):
    if not results.get("success", False):
        return f"Error: {results.get('error', 'Unknown error')}"
    
    data = results.get("results", [])
    columns = results.get("columns", [])
    
    if not data:
        return "The query returned no results."
    
    # manually formatting as table-like string
    output = [" | ".join(columns)]
    output.append("-" * len(output[0]))
    
    for row in data:
        row_values = [str(row.get(col, "")) for col in columns]
        output.append(" | ".join(row_values))
    return "\n".join(output)
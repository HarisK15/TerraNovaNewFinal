import sqlite3
import os
import pandas as pd
import json
import re
import numpy as np

def get_database_schema(file_path):
    try:
        abs_file_path = os.path.abspath(file_path)  
        print(f"Checking file at {abs_file_path}")

        file_extension = os.path.splitext(abs_file_path)[1].lower()
        
        schema = {}
        
        # check whether file uploaded is a database 
        if file_extension == '.db':
            conn = sqlite3.connect(abs_file_path)
            cursor = conn.cursor()

            # Get all table names
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"✅ DEBUG: Found Tables: {tables}")

            # extract column names from upload for use in llm
            for table in tables:
                cursor.execute(f"PRAGMA table_info({table});")
                columns = [row[1] for row in cursor.fetchall()]
                schema[table] = columns
                print(f"✅ DEBUG: Columns in {table}: {columns}")

            conn.close()

        # check if file uploaded is a csv file
        elif file_extension == '.csv':
            df_sample = pd.read_csv(abs_file_path, nrows=5)
            # Always use 'data' as the table name for CSV files
            schema['data'] = df_sample.columns.tolist()
            print(f"✅ DEBUG: CSV Columns: {schema['data']}")
            
        return schema

    except Exception as e:
        return {"error": f"⚠️ Error processing file: {str(e)}"}

def format_schema_for_prompt(schema):
    """Format the schema information for the LLM prompt."""
    if isinstance(schema, dict) and "error" in schema:
        return f"Error in schema: {schema['error']}"
        
    formatted_schema = ["Database Schema:"]
    
    for table, columns in schema.items():
        formatted_schema.append(f"Table: {table}")
        formatted_schema.append(f"Columns: {', '.join(columns)}")
        
        # Add example values if available
        try:
            if table.endswith('.csv'):
                file_path = os.path.join('uploads', table)
            else:
                file_path = os.path.join('uploads', f"{table}.db")
                
            if os.path.exists(file_path):
                # For each table, get a sample row to show example values
                if file_path.endswith('.db'):
                    conn = sqlite3.connect(file_path)
                    cursor = conn.cursor()
                    cursor.execute(f"SELECT * FROM {table} LIMIT 1")
                    sample_row = cursor.fetchone()
                    conn.close()
                    
                    if sample_row:
                        example_values = dict(zip(columns, sample_row))
                        formatted_schema.append("Example Values:")
                        for col, value in example_values.items():
                            formatted_schema.append(f"  - {col}: {value}")
                else:  # CSV file
                    df = pd.read_csv(file_path, nrows=1)
                    if not df.empty:
                        example_values = df.iloc[0].to_dict()
                        formatted_schema.append("Example Values:")
                        for col, value in example_values.items():
                            formatted_schema.append(f"  - {col}: {value}")
        except Exception as e:
            pass  # Silently fail if we can't get example values
            
        formatted_schema.append("")
    
    return "\n".join(formatted_schema)

def execute_pandas_query(file_path, pandas_code):
    """
    Execute a pandas query on a CSV file.
    
    Args:
        file_path (str): Path to the CSV file
        pandas_code (str): Pandas query code to execute
        
    Returns:
        dict: Contains the query execution results or error information
    """
    try:
        # Resolve to an absolute path if needed
        abs_file_path = os.path.abspath(file_path)
        
        if not os.path.exists(abs_file_path):
            return {"success": False, "error": f"File not found: {file_path}"}
        
        # Determine the file format
        file_extension = os.path.splitext(abs_file_path)[1].lower()
        
        if file_extension != '.csv':
            return {"success": False, "error": "This operation is only supported for CSV files"}
            
        # Read the CSV file
        print(f"Successfully read CSV file: {abs_file_path}")
        df = pd.read_csv(abs_file_path)
        print(f"DataFrame shape: {df.shape}")
        print(f"DataFrame columns: {df.columns.tolist()}")
        
        # Special case for simple column selection like df[['col1', 'col2']]
        column_selection_pattern = r"df\[\[(.+)\]\]"
        match = re.search(column_selection_pattern, pandas_code)
        if match:
            columns_str = match.group(1)
            print(f"Detected simple column selection: {columns_str}")
            
            # Extract column names from the string
            try:
                # Split by comma and remove quotes and whitespace
                requested_columns = []
                for col_str in columns_str.split(','):
                    # Remove quotes and spaces
                    clean_col = col_str.strip().strip("'").strip('"')
                    requested_columns.append(clean_col)
                
                print(f"Requested columns: {requested_columns}")
                # Filter to only include columns that exist in the DataFrame
                valid_columns = [col for col in requested_columns if col in df.columns]
                print(f"Valid columns found in DataFrame: {valid_columns}")
                
                if valid_columns:
                    result_df = df[valid_columns]
                    print(f"Successfully selected columns: {valid_columns}")
                    return {
                        "success": True,
                        "results": result_df.to_dict(orient='records'),
                        "columns": valid_columns
                    }
                else:
                    print("No valid columns found in DataFrame")
                    return {
                        "success": False,
                        "error": f"None of the requested columns {requested_columns} were found in the DataFrame. Available columns are: {df.columns.tolist()}"
                    }
            except Exception as column_error:
                print(f"Error processing column selection: {str(column_error)}")
                # Fall through to standard execution
        
        # Execute the pandas code directly
        print(f"Running pandas code: {pandas_code[:100]}...")
        
        # Create locals dictionary with the DataFrame
        locals_dict = {'df': df, 'result': None}
        
        try:
            # Execute the pandas code with no timeout limitation
            exec(f"result = {pandas_code}", {'pd': pd, 'np': np, '__builtins__': {}}, locals_dict)
            
        except Exception as exec_error:
            print(f"Error executing pandas code: {str(exec_error)}")
            return {
                "success": False,
                "error": f"Error executing pandas code: {str(exec_error)}"
            }
        
        # Handle value_counts results with duplicate column names
        if isinstance(locals_dict['result'], pd.DataFrame) and len(locals_dict['result'].columns) == 2 and locals_dict['result'].columns.duplicated().any():
            print("Fixing duplicate column names in value_counts() result")
            locals_dict['result'].columns = ["value", "count"]
        
        # If result is a DataFrame, convert it to a dictionary for JSON
        if isinstance(locals_dict['result'], pd.DataFrame):
            print(f"Query results shape: {locals_dict['result'].shape}")
            if not locals_dict['result'].empty:
                print(f"First few results:")
                print(locals_dict['result'].head(3))
                
                # Check for duplicate column names and fix them
                if any(locals_dict['result'].columns.duplicated()):
                    print("Found duplicate column names, renaming them")
                    # Rename duplicate columns by adding a number suffix
                    cols = list(locals_dict['result'].columns)
                    for i, col in enumerate(cols):
                        count = cols[:i].count(col)
                        if count > 0:
                            cols[i] = f"{col}_{count}"
                    locals_dict['result'].columns = cols
            
            # Convert DataFrame to dict for JSON serialization
            results_dict = locals_dict['result'].to_dict(orient='records')
            
            return {
                "success": True,
                "results": results_dict,
                "columns": locals_dict['result'].columns.tolist()
            }
        elif isinstance(locals_dict['result'], pd.Series):
            print(f"Result is a Series with shape: {locals_dict['result'].shape}")
            # Convert Series to DataFrame first
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
            print(f"Result is not a DataFrame or Series: {type(locals_dict['result'])}")
            # Convert to a single-item list for consistency
            return {
                "success": True,
                "results": [{"result": locals_dict['result']}],
                "columns": ["result"]
            }
            
    except Exception as e:
        print(f"Error in execute_pandas_query: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def execute_query(file_path, sql_query):
    """Execute an SQL query against the database or CSV file."""
    try:
        abs_file_path = os.path.abspath(file_path)
        file_extension = os.path.splitext(abs_file_path)[1].lower()
        
        # For SQLite database
        if file_extension == '.db':
            conn = sqlite3.connect(abs_file_path)
            
            # Execute the query and fetch results
            results = pd.read_sql_query(sql_query, conn)
            conn.close()
            
            return {
                "success": True,
                "results": results.to_dict(orient="records"),
                "columns": results.columns.tolist()
            }
            
        # For CSV file
        elif file_extension == '.csv':
            # Read the CSV into a DataFrame
            df = pd.read_csv(abs_file_path)
            
            # Print the first few rows and column names for debugging
            print(f"✅ DEBUG: CSV DataFrame columns: {df.columns.tolist()}")
            print(f"✅ DEBUG: CSV DataFrame sample data:\n{df.head(3)}")
            
            # CSV files need special handling - we'll create a temporary SQLite database in memory
            conn = sqlite3.connect(":memory:")
            # Always use 'data' as the table name for all CSV files
            table_name = 'data'
            
            # Write the DataFrame to the in-memory database
            df.to_sql(table_name, conn, index=False, if_exists="replace")
            
            # Verify table creation
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"✅ DEBUG: Tables in memory DB: {tables}")
            
            # Get column names from the table
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = [row[1] for row in cursor.fetchall()]
            print(f"✅ DEBUG: Columns in memory DB table: {columns}")
            
            # Print the SQL query being executed
            print(f"✅ DEBUG: Executing SQL Query on CSV data: {sql_query}")
            
            # Execute the query
            try:
                results = pd.read_sql_query(sql_query, conn)
                print(f"✅ DEBUG: Query results shape: {results.shape}")
                if not results.empty:
                    print(f"✅ DEBUG: First few results:\n{results.head(3)}")
                else:
                    print("✅ DEBUG: Query returned no results")
            except Exception as e:
                print(f"⚠️ ERROR executing SQL query: {str(e)}")
                raise
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
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def format_results(results):
    """Format the results for display and for use in the explanation prompt."""
    if not results.get("success", False):
        return f"Error: {results.get('error', 'Unknown error')}"
    
    data = results.get("results", [])
    columns = results.get("columns", [])
    
    if not data:
        return "The query returned no results."
    
    # Format as a table-like string
    output = [" | ".join(columns)]
    output.append("-" * len(output[0]))
    
    for row in data:
        row_values = [str(row.get(col, "")) for col in columns]
        output.append(" | ".join(row_values))
    
    return "\n".join(output)
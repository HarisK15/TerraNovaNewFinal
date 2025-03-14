import sqlite3
import os
import pandas as pd
import json

def get_database_schema(file_path):
    """Extract table and column names from an SQLite database or CSV file."""
    try:
        abs_file_path = os.path.abspath(file_path)  # Ensure absolute path
        print(f"✅ DEBUG: Checking file at {abs_file_path}")

        # Determine file type based on extension
        file_extension = os.path.splitext(abs_file_path)[1].lower()
        
        schema = {}
        
        if file_extension == '.db':
            # Handle SQLite database
            conn = sqlite3.connect(abs_file_path)
            cursor = conn.cursor()

            # Get all table names
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"✅ DEBUG: Found Tables: {tables}")

            # Get column names for each table
            for table in tables:
                cursor.execute(f"PRAGMA table_info({table});")
                columns = [row[1] for row in cursor.fetchall()]
                schema[table] = columns
                print(f"✅ DEBUG: Columns in {table}: {columns}")

            conn.close()
            
        elif file_extension == '.csv':
            # Handle CSV file
            # Read a small sample to get column names
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
    """Execute a Pandas query on a CSV file."""
    try:
        # Import necessary modules for Pandas operations
        import pandas as pd
        import numpy as np
        
        abs_file_path = os.path.abspath(file_path)
        file_extension = os.path.splitext(abs_file_path)[1].lower()
        
        # Only CSV files are supported for Pandas queries
        if file_extension != '.csv':
            return {
                "success": False,
                "error": f"Pandas queries are only supported for CSV files, not {file_extension} files"
            }
        
        # Read the CSV into a DataFrame
        df = pd.read_csv(abs_file_path)
        
        # Print the first few rows and column names for debugging
        print(f"✅ DEBUG: CSV DataFrame columns: {df.columns.tolist()}")
        print(f"✅ DEBUG: CSV DataFrame sample data:\n{df.head(3)}")
        
        # Print the pandas code being executed
        print(f"✅ DEBUG: Executing Pandas Query on CSV data:\n{pandas_code}")
        
        # Execute the pandas code 
        try:
            # Create a dictionary with safe globals
            safe_globals = {
                'pd': pd,
                'np': np,
                'DataFrame': pd.DataFrame,
                'Series': pd.Series,
                'len': len,
                'str': str,
                'int': int,
                'float': float,
                'list': list,
                'dict': dict,
                'min': min,
                'max': max,
                'sum': sum,
                'sorted': sorted,
                'round': round
            }
            
            # Create locals dictionary with the DataFrame
            locals_dict = {'df': df, 'result': None}
            
            # Pre-process the pandas code to fix common issues with column naming
            # This fixes common patterns like value_counts() with rename() that often lead to duplicate column names
            fixed_code = pandas_code
            
            # Log the exact pandas code being executed
            print(f"✅ DEBUG: Executing pandas code: {fixed_code}")
            
            # Execute the pandas code in a safer but more functional environment
            exec(f"result = {fixed_code}", safe_globals, locals_dict)
            
            # Get the result from the locals dictionary
            result = locals_dict.get('result')
            
            # Print the columns in the result for debugging
            if isinstance(result, pd.DataFrame):
                print(f"✅ DEBUG: Result columns from query: {result.columns.tolist()}")
            
            # For export queries with df[...] pattern, ensure only selected columns are included
            # This handles cases where our intent detection found specific columns but they weren't properly filtered
            if isinstance(result, pd.DataFrame) and pandas_code.startswith('df[[') and 'if col in df.columns' in pandas_code:
                # This looks like an export query, so we should extract the column list and filter explicitly
                try:
                    # Extract column names from the query
                    import re
                    col_match = re.search(r'df\[\[(.*?)\]\]', pandas_code)
                    if col_match:
                        col_expr = col_match.group(1)
                        # Extract just the column names
                        cols = re.findall(r"'([^']*)'", col_expr)
                        if cols:
                            print(f"✅ DEBUG: Filtering to these columns: {cols}")
                            # Only keep columns that exist in the dataframe
                            valid_cols = [col for col in cols if col in result.columns]
                            if valid_cols:
                                result = result[valid_cols]
                                print(f"✅ DEBUG: Filtered result to columns: {result.columns.tolist()}")
                except Exception as e:
                    print(f"⚠️ DEBUG: Error in column filtering: {str(e)}")
            
            # For value_counts results, let's manually fix the column naming
            # This is a targeted fix for the common pattern we're seeing issues with
            if isinstance(result, pd.DataFrame) and len(result.columns) == 2 and result.columns.duplicated().any():
                # This looks like a value_counts() result with duplicate column names
                # Directly set proper column names
                col_base = result.columns[0]
                result.columns = ["value", "count"]
            
            # If result is a DataFrame, convert it to a dictionary for JSON serialization
            if isinstance(result, pd.DataFrame):
                print(f"✅ DEBUG: Query results shape: {result.shape}")
                if not result.empty:
                    print(f"✅ DEBUG: First few results:\n{result.head(3)}")
                    
                    # Check for duplicate column names and fix them
                    if any(result.columns.duplicated()):
                        print("✅ DEBUG: Found duplicate column names. Renaming columns to make them unique.")
                        # Create a mapping for renaming columns with numerical suffixes
                        # This preserves the original column names while making them unique
                        new_columns = []
                        seen = {}
                        for col in result.columns:
                            if col in seen:
                                seen[col] += 1
                                new_columns.append(f"{col}_{seen[col]}")
                            else:
                                seen[col] = 0
                                new_columns.append(col)
                        
                        # Rename the columns
                        result.columns = new_columns
                        print(f"✅ DEBUG: Renamed columns to: {result.columns.tolist()}")
                else:
                    print("✅ DEBUG: Query returned no results")
                    
                # Convert NumPy types to native Python types for JSON serialization
                def convert_numpy_types(obj):
                    import numpy as np
                    if isinstance(obj, np.integer):
                        return int(obj)
                    elif isinstance(obj, np.floating):
                        return float(obj)
                    elif isinstance(obj, np.ndarray):
                        return obj.tolist()
                    elif isinstance(obj, pd.Series):
                        return convert_numpy_types(obj.values)
                    elif isinstance(obj, pd.DataFrame):
                        return {col: convert_numpy_types(result[col]) for col in result.columns}
                    elif isinstance(obj, dict):
                        return {k: convert_numpy_types(v) for k, v in obj.items()}
                    elif isinstance(obj, list):
                        return [convert_numpy_types(item) for item in obj]
                    else:
                        return obj
                
                # Create JSON-compatible results
                results_dict = result.to_dict(orient="records")
                results_dict = convert_numpy_types(results_dict)
                
                return {
                    "success": True,
                    "results": results_dict,
                    "columns": result.columns.tolist()
                }
            else:
                # Handle scalar or other non-DataFrame results
                print(f"✅ DEBUG: Query returned a non-DataFrame result: {result}")
                return {
                    "success": True,
                    "results": [{"Result": result}],
                    "columns": ["Result"]
                }
                
        except Exception as e:
            print(f"⚠️ ERROR executing Pandas query: {str(e)}")
            return {
                "success": False,
                "error": f"Error executing Pandas query: {str(e)}"
            }
            
    except Exception as e:
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
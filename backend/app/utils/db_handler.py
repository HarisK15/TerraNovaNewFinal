import sqlite3
import os
import pandas as pd
import json
import re

# This file handles database operations for both SQLite and CSV files
# It has functions to get the schema, execute queries, and format results
# TODO: Add better error handling
# TODO: Add caching for frequently accessed schemas

def get_database_schema(file_path):
    """Extract table and column names from an SQLite database or CSV file."""
    try:
        abs_file_path = os.path.abspath(file_path)  # Ensure absolute path
        print(f"Getting schema for file: {abs_file_path}")

        # Determine file type based on extension
        file_extension = os.path.splitext(abs_file_path)[1].lower()
        print(f"File extension: {file_extension}")
        
        schema = {}
        
        if file_extension == '.db':
            # Handle SQLite database
            print("SQLite database detected")
            conn = sqlite3.connect(abs_file_path)
            cursor = conn.cursor()

            # Get all table names
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"Found tables: {tables}")

            # Get column names for each table
            for table in tables:
                cursor.execute(f"PRAGMA table_info({table});")
                columns = [row[1] for row in cursor.fetchall()]
                schema[table] = columns
                print(f"Columns in {table}: {columns}")

            conn.close()
            
        elif file_extension == '.csv':
            # Handle CSV file
            print("CSV file detected")
            # Read a small sample to get column names
            df_sample = pd.read_csv(abs_file_path, nrows=5)
            # Always use 'data' as the table name for CSV files
            schema['data'] = df_sample.columns.tolist()
            print(f"CSV Columns: {schema['data']}")
            
        return schema

    except Exception as e:
        print(f"Error processing file: {str(e)}")
        return {"error": f"Error processing file: {str(e)}"}

def format_schema_for_prompt(schema):
    """Format the schema information for the LLM prompt."""
    print("Formatting schema for AI prompt...")
    
    if isinstance(schema, dict) and "error" in schema:
        print(f"Error in schema: {schema['error']}")
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
                print(f"Getting example values from {file_path}")
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
            print(f"Couldn't get example values: {str(e)}")
            # Silently fail if we can't get example values
            
        formatted_schema.append("")
    
    return "\n".join(formatted_schema)

def execute_pandas_query(file_path, pandas_code):
    """Execute a pandas query against a CSV file."""
    print(f"Executing pandas query: {pandas_code}")
    
    try:
        # Read the CSV file into a pandas DataFrame
        df = pd.read_csv(file_path)
        print(f"Successfully read CSV file: {file_path}")
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
            
            # Log the exact pandas code being executed
            print(f"Running pandas code: {pandas_code[:100]}...")
            
            # Execute the pandas code
            exec(f"result = {pandas_code}", safe_globals, locals_dict)
            
            # Get the result from the locals dictionary
            result = locals_dict.get('result')
            
            # Handle value_counts results with duplicate column names
            if isinstance(result, pd.DataFrame) and len(result.columns) == 2 and result.columns.duplicated().any():
                print("Fixing duplicate column names in value_counts() result")
                result.columns = ["value", "count"]
            
            # If result is a DataFrame, convert it to a dictionary for JSON
            if isinstance(result, pd.DataFrame):
                print(f"Query results shape: {result.shape}")
                if not result.empty:
                    print(f"First few results:")
                    print(result.head(3))
                    
                    # Check for duplicate column names and fix them
                    if any(result.columns.duplicated()):
                        print("Found duplicate column names, renaming them")
                        # Rename duplicate columns by adding a number suffix
                        cols = list(result.columns)
                        for i, col in enumerate(cols):
                            count = cols[:i].count(col)
                            if count > 0:
                                cols[i] = f"{col}_{count}"
                        result.columns = cols
                
                # Convert DataFrame to dict for JSON serialization
                results_dict = result.to_dict(orient='records')
                
                return {
                    "success": True,
                    "results": results_dict,
                    "columns": result.columns.tolist()
                }
            elif isinstance(result, pd.Series):
                print(f"Result is a Series with shape: {result.shape}")
                # Convert Series to DataFrame first
                result_df = result.reset_index()
                
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
                print(f"Result is not a DataFrame or Series: {type(result)}")
                # Convert to a single-item list for consistency
                return {
                    "success": True,
                    "results": [{"result": result}],
                    "columns": ["result"]
                }
                
        except Exception as e:
            print(f"Error executing pandas code: {str(e)}")
            return {
                "success": False,
                "error": f"Error executing pandas code: {str(e)}"
            }
            
    except Exception as e:
        print(f"Error in execute_pandas_query: {str(e)}")
        return {
            "success": False,
            "error": f"Error: {str(e)}"
        }

def execute_query(file_path, sql_query):
    """Execute an SQL query against the database or CSV file."""
    print(f"Executing SQL query: {sql_query}")
    try:
        abs_file_path = os.path.abspath(file_path)
        file_extension = os.path.splitext(abs_file_path)[1].lower()
        
        # Execute against SQLite database
        if file_extension == '.db':
            print(f"Running SQL query on SQLite database")
            conn = sqlite3.connect(abs_file_path)
            # Convert row objects to dictionaries for better JSON serialization
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Execute the query
            cursor.execute(sql_query)
            
            # Get column names from the cursor description
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            # Fetch all results
            rows = cursor.fetchall()
            
            # Convert rows to list of dicts for JSON serialization
            results = [dict(row) for row in rows]
            
            conn.close()
            
            print(f"SQL query returned {len(results)} rows")
            
            return {
                "success": True,
                "results": results,
                "columns": columns
            }
            
        elif file_extension == '.csv':
            print(f"Running SQL query on CSV file using pandas")
            # For CSV files, use pandas to execute SQL-like queries
            df = pd.read_csv(abs_file_path)
            
            # Create a SQLite connection in memory
            conn = sqlite3.connect(':memory:')
            
            # Write the DataFrame to a SQLite table
            df.to_sql('data', conn, index=False)
            
            # Execute the query
            cursor = conn.cursor()
            cursor.execute(sql_query)
            
            # Get column names
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            # Fetch all results
            rows = cursor.fetchall()
            
            # Convert results to list of dicts
            results = []
            for row in rows:
                result_dict = {}
                for i, col in enumerate(columns):
                    result_dict[col] = row[i]
                results.append(result_dict)
            
            conn.close()
            
            print(f"SQL query on CSV returned {len(results)} rows")
            
            return {
                "success": True,
                "results": results,
                "columns": columns
            }
            
        else:
            print(f"Unsupported file extension: {file_extension}")
            return {
                "success": False,
                "error": f"Unsupported file extension: {file_extension}"
            }
            
    except Exception as e:
        print(f"Error executing query: {str(e)}")
        return {
            "success": False,
            "error": f"Error executing query: {str(e)}"
        }

def format_results(results):
    """Format the results for display."""
    print("Formatting results for display")
    if not results or "results" not in results:
        return "No results returned."
    
    formatted = []
    data = results["results"]
    
    if not data:
        return "Query executed successfully, but no data was returned."
    
    # Format as table-like structure
    columns = results.get("columns", [])
    if columns:
        formatted.append(", ".join(columns))
        formatted.append("-" * 40)
    
    # Add rows
    for row in data[:10]:  # Limit to 10 rows to avoid huge responses
        if isinstance(row, dict):
            formatted.append(", ".join(str(row.get(col, "")) for col in columns))
        else:
            formatted.append(str(row))
    
    if len(data) > 10:
        formatted.append(f"... and {len(data) - 10} more rows")
    
    return "\n".join(formatted)
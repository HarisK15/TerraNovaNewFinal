# 📌 Executes AI-generated SQL/Pandas queries.
# 🔗 Connected to:
# 	•	query_routes.py (Executes queries before sending results)
# 	•	db_handler.py (Runs SQL queries on SQLite DB)
#
# ✅ Features to Implement:
# 	•	Check if query is SQL or Pandas
# 	•	Execute query safely & prevent SQL injection
# 	•	Return formatted results for frontend
import os.path
import sqlite3
import pandas as pd
import re
from langchain_core.messages import AIMessage
from langchain.schema.runnable import RunnableLambda
from app.services.langchain_service import generate_sql_query, generate_pandas_query


import os
import sqlite3

import os
import sqlite3

def execute_sql_query(query, db_path):
    abs_db_path = os.path.abspath(db_path)  # ✅ Ensure absolute path
    print(f"✅ DEBUG: Using Database at {abs_db_path}")  # ✅ Debugging Output

    if not os.path.exists(abs_db_path):
        return f"Error: Database file is not found at {abs_db_path}"

    conn = sqlite3.connect(abs_db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print(f"✅ DEBUG: Executing SQL Query: {query.strip()}")
    cursor.execute(query.strip())
    results = cursor.fetchall()
    conn.close()

    if results:
        return [dict(row) for row in results]
    else:
        return "⚠️ No matching records found."

def execute_pandas_query(query, df):
    try:
        # Handle simple count queries that don't return DataFrames
        if query.strip() in ['len(df)', 'df.shape[0]']:
            count = len(df)
            return pd.DataFrame({"Total Count": [count]})
        
        # Handle other aggregation functions that return scalar values
        if any(agg_func in query for agg_func in ['.mean()', '.sum()', '.min()', '.max()', '.count()']):
            result_df = eval(query, {"df": df})
            if not isinstance(result_df, pd.DataFrame):
                # Convert scalar result to a DataFrame with appropriate column name
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
        print(f"Error executing Pandas query: {error_message}")
        
        # More helpful error message for common issues
        if "No group keys passed" in error_message:
            return pd.DataFrame({"Error": ["Invalid groupby operation. For simple count queries, use len(df) instead."]})
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
        return pd.DataFrame({"Error": [f"Error executing Pandas query: {error_message}"]})



def process_query(user_query, llm_model, db_path=None, df=None):
    try:
        if db_path:
            sql_query = generate_sql_query(user_query, llm_model)
            return execute_sql_query(sql_query, db_path)
        elif df is not None:
            Pandas_query = generate_pandas_query(user_query, llm_model)
            return execute_pandas_query(Pandas_query, df)
        else:
            return "Error: No query provided"

    except Exception as e:
        return f"Processing Error: {str(e)}"



if __name__ == "__main__":
    from langchain_service import initialize_langchain_service

    llm_models = initialize_langchain_service()

    # Test SQL Query Execution
    test_sql_query = "Show all employees in New York City earning more than 50,000 USD"
    sql_results = process_query(test_sql_query, llm_models, db_path="../../uploads/test.db", df=None)
    print("\n🔹 SQL Query Results:\n", sql_results)

    # Test Pandas Query Execution
    # test_pandas_query = "Show all customer_ids for customers in GO"
    # df = pd.read_csv("terranova.csv")  # Load CSV
    # pandas_results = process_query(test_pandas_query, llm_models, db_path=None, df=df)
    # print("\n🔹 Pandas Query Results:\n", pandas_results)
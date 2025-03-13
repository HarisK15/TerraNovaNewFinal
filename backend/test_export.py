import os
import pandas as pd
import sys
import json

# Add the current directory to path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.ollama_service import detect_export_intent

def print_header(text):
    print("\n" + "=" * 60)
    print(text)
    print("=" * 60)

def test_csv_export():
    print_header("Testing CSV Export")
    
    # Path to test CSV file
    file_path = "./uploads/f801336ee206477d8a1ce7b5097cbb29.csv"
    if not os.path.exists(file_path):
        files = os.listdir("./uploads")
        for file in files:
            if file.endswith(".csv"):
                file_path = f"./uploads/{file}"
                break
    
    # Load the CSV
    print(f"Loading CSV from: {file_path}")
    df = pd.read_csv(file_path)
    
    print(f"DataFrame columns: {df.columns.tolist()}")
    print(f"DataFrame sample data:\n{df.head(3)}")
    
    # Test export intent detection
    test_queries = [
        "Export customer information as a CSV file with columns for customer id and customer state",
        "Create an Excel report with customer names and their purchase totals",
        "Save order details to JSON including order_id and product_id"
    ]
    
    for query in test_queries:
        print("\nQuery:", query)
        export_intent = detect_export_intent(query)
        print("Export intent:", json.dumps(export_intent, indent=2))
        
        # Map requested columns to actual columns
        print("Mapping columns to actual dataframe columns...")
        available_columns = df.columns.tolist()
        if export_intent["is_export"] and export_intent["columns"]:
            mapped_columns = []
            for requested_col in export_intent["columns"]:
                print(f"  Looking for column matching '{requested_col}'")
                # Try to find the best matching column
                best_match = None
                best_score = 0
                
                for actual_col in available_columns:
                    actual_col_lower = actual_col.lower()
                    # Check for exact match
                    if actual_col_lower == requested_col:
                        best_match = actual_col
                        print(f"    Exact match found: {actual_col}")
                        break
                    # Check if column contains the requested name
                    elif requested_col in actual_col_lower:
                        score = len(requested_col) / len(actual_col_lower)
                        if score > best_score:
                            best_score = score
                            best_match = actual_col
                
                if best_match:
                    mapped_columns.append(best_match)
                    print(f"    Best match found: {best_match} (score: {best_score:.2f})")
                else:
                    print(f"    No match found for {requested_col}")
            
            # If we mapped some columns, update the export intent
            if mapped_columns:
                export_intent["mapped_columns"] = mapped_columns
            else:
                # If no columns could be mapped, use all columns
                export_intent["mapped_columns"] = available_columns
        else:
            # For non-export or no specified columns, use all columns
            export_intent["mapped_columns"] = available_columns
        
        print("Final mapped columns:", export_intent.get("mapped_columns", []))
        
        # Generate a Pandas query
        column_list = ", ".join([f"'{col}'" for col in export_intent.get("mapped_columns", [])])
        pandas_query = f"df[[col for col in [{column_list}] if col in df.columns]]"
        print("Generated pandas query:", pandas_query)
        
        # Execute the query
        try:
            # Safe execution of the query
            result_df = eval(pandas_query)
            print(f"Result shape: {result_df.shape}")
            print(f"Result columns: {result_df.columns.tolist()}")
            print(f"First few results:\n{result_df.head(3)}")
        except Exception as e:
            print(f"Error executing query: {str(e)}")
            
        print("-" * 60)

if __name__ == "__main__":
    test_csv_export()

"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")
"""
Test Script for Export Templates

This script demonstrates how to use specific export templates with the sample data.
It will generate an Excel file with statistical analysis of the sales data.
"""

import pandas as pd
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))
from app.services.query_executor import execute_pandas_query

def test_statistical_summary_template():
    """
    Test the statistical summary export template with the sales data.
    This will generate an analysis Excel file with summary statistics.
    """
    # Load the sample data
    data_path = "../sample_data/sales_data.csv"
    
    try:
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
        
        # Display available columns
        print(f"Columns: {df.columns.tolist()}")
        
        # Calculate basic statistics for numeric columns using pandas
        numeric_cols = df.select_dtypes(include=['number']).columns
        print(f"\nNumeric columns: {numeric_cols.tolist()}")
        
        # Basic statistics
        stats = df[numeric_cols].describe()
        print("\nStatistics Summary:")
        print(stats)
        
        # Export to Excel with summary statistics (simulating template)
        output_path = "../sample_data/sales_analysis_summary.xlsx"
        
        # Create a Excel writer with multiple sheets
        with pd.ExcelWriter(output_path) as writer:
            # Raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Statistics sheet
            stats.to_excel(writer, sheet_name='Summary Statistics')
            
        print(f"\nExported analysis to {output_path}")
        
        # Simulate another example - Sales by Category
        print("\nSales by Category Summary:")
        category_summary = df.groupby('category').agg({
            'total_value': ['sum', 'mean', 'count'],
            'quantity': ['sum', 'mean'],
            'price': ['mean', 'min', 'max']
        })
        print(category_summary)
        
        # Export category analysis
        category_output = "../sample_data/sales_by_category.xlsx"
        with pd.ExcelWriter(category_output) as writer:
            # Raw data
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Category summary
            category_summary.to_excel(writer, sheet_name='Category Analysis')
            
        print(f"\nExported category analysis to {category_output}")
        
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Export Templates...")
    test_statistical_summary_template()
    print("Done!")

# RAG stuff for  CSV datasets
# Contains examples and metadata to help LLM understand dataset
# Tod: Add more examples, patterns if time
# Todo: Replace with vector DB if time    

import random 
import os
import logging
from app.utils.vector_store import VectorStore

logger = logging.getLogger(__name__)

# file info for given training csv files
csv_files = {
    "Customers": {
        "description": "Customer info including location and ids",
        "columns": ["customer_id", "customer_zip_code_prefix", "customer_city", "customer_state"],
        "links": [
            {"connects_to": "orders", "via": "customer_id", "type": "one-to-many"}
        ],
        "example_qs": [
            "What are the zip code prefixes for customers in RJ?",
            "List all customers from SP who placed more than 5 orders",
            "How many customers are there in each state?",
            "Which city has the most customers?",
            "What's the average order value for customers in SP?"
        ]
    },
    "OrderItems": {
        "description": "Info about items in orders, prices, shipping etc",
        "columns": ["order_id", "product_id", "seller_id", "price", "shipping_charges"],
        "links": [
            {"connects_to": "orders", "via": "order_id", "type": "many-to-one"},
            {"connects_to": "products", "via": "product_id", "type": "many-to-one"}
        ],
        "example_qs": [
            "Show me the top 5 most expensive products (including shipping) and their sellers",
            "What's the average price of items in order_id X?",
            "Which seller has the highest total sales?",
            "How many orders have more than 3 items?",
            "Calculate the average shipping cost per order"
        ]
    },
    "Orders": {
        "description": "Order info including status, timestamps, and delivery details",
        "columns": ["order_id", "customer_id", "order_status", "order_purchase_timestamp", 
                    "order_approved_at", "order_delivered_timestamp", "order_estimated_delivery_date"],
        "links": [
            {"connects_to": "Customers", "via": "customer_id", "type": "many-to-one"},
            {"connects_to": "order_items", "via": "order_id", "type": "one-to-many"},
            {"connects_to": "payments", "via": "order_id", "type": "one-to-many"}
        ],
        "example_qs": [
            "When was this order_id delivered?",
            "How many orders were delayed beyond the estimated delivery date?",
            "What is the average time between purchase and delivery?",
            "List all orders with status 'delivered' from last month"
        ]
    },
    "Payments": {
        "description": "Payment info for orders including method and value",
        "columns": ["order_id", "payment_sequential", "payment_type", "payment_installments", "payment_value"],
        "links": [
            {"connects_to": "Orders", "via": "order_id", "type": "many-to-one"}
        ],
        "example_qs": [
            "What's the average payment value for credit card payments?",
            "Which payment method has the highest total revenue?",
            "How many payments were made in installments?",
            "What's the distribution of payment methods?",
            "Calculate the total payment value by payment type"
        ]
    },
    "Products": {
        "description": "Product details including category, dimensions, and weight",
        "columns": ["product_id", "product_category_name", "product_weight_g", 
                    "product_length_cm", "product_height_cm", "product_width_cm"],
        "links": [
            {"connects_to": "OrderItems", "via": "product_id", "type": "one-to-many"}
        ],
        "example_qs": [
            "What is the average weight of furniture items?",
            "Which product has the largest volume?",
            "How many products are in each category?",
            "What's the weight of product X?",
            "List the dimensions of the heaviest products"
        ]
    }
}

# Common patterns that come up/ will be expected to be performed by user
query_patterns = [
    {
        "pattern": "first [0-9]+ rows",
        "desc": "Get first N rows",
        "pandas": "df.head({n})",
        "sql": "SELECT * FROM {table} LIMIT {n}"
    },
    {
        "pattern": "average|avg|mean",
        "desc": "Get average of column",
        "pandas": "df['{column}'].mean()",
        "sql": "SELECT AVG({column}) FROM {table}"
    },
    {
        "pattern": "count|how many",
        "desc": "Count records, maybe with grouping",
        "pandas": "df.groupby('{group_col}')['{count_col}'].count()",
        "sql": "SELECT {group_col}, COUNT({count_col}) FROM {table} GROUP BY {group_col}"
    },
    {
        "pattern": "top|highest|most expensive",
        "desc": "Find top values",
        "pandas": "df.sort_values('{sort_col}', ascending=False).head({n})",
        "sql": "SELECT * FROM {table} ORDER BY {sort_col} DESC LIMIT {n}"
    },
    {
        "pattern": "total|sum",
        "desc": "Sum up values",
        "pandas": "df.groupby('{group_col}')['{sum_col}'].sum()",
        "sql": "SELECT {group_col}, SUM({sum_col}) FROM {table} GROUP BY {group_col}"
    },
    {
        "pattern": "order.*delivered|delivered.*order",
        "desc": "Find delivery info",
        "pandas": "df[df['order_id'] == '{order_id}']['order_delivered_timestamp']",
        "sql": "SELECT order_delivered_timestamp FROM orders WHERE order_id = '{order_id}'"
    },
    {
        "pattern": "delayed|late",
        "desc": "Find late orders",
        "pandas": "df[df['order_delivered_timestamp'] > df['order_estimated_delivery_date']]",
        "sql": "SELECT * FROM orders WHERE order_delivered_timestamp > order_estimated_delivery_date"
    }
]

# example + expected return
query_examples = [
    {
        "query": "Show me the first 5 rows",
        "code": "df.head(5)",
        "file_type": "any",
        "notes": "Shows first 5 rows"
    },
    {
        "query": "What are the zip code prefixes for customers in RJ?",
        "code": "df[df['customer_state'] == 'RJ']['customer_zip_code_prefix']",
        "file_type": "customers",
        "notes": "Filters customers by state and shows zip codes"
    },
    {
        "query": "When was order 12345 delivered?",
        "code": "df[df['order_id'] == '12345']['order_delivered_timestamp']",
        "file_type": "orders",
        "notes": "Gets delivery timestamp for a specific order"
    },
    {
        "query": "What's the average payment value for credit card payments?",
        "code": "df[df['payment_type'] == 'credit_card']['payment_value'].mean()",
        "file_type": "payments",
        "notes": "Calculates mean payment value filtered by payment type"
    },
    {
        "query": "Which product has the largest volume?",
        "code": "df.assign(volume=df['product_length_cm'] * df['product_width_cm'] * df['product_height_cm']).sort_values('volume', ascending=False).head(1)",
        "file_type": "products",
        "notes": "Calculates volume and finds product with maximum volume"
    },
    {
        "query": "List all customers from SP who placed more than 5 orders",
        "code": """# This requires joining customers and orders
        customer_order_counts = df_orders.groupby('customer_id').size().reset_index(name='order_count')
        sp_customers = df_customers[df_customers['customer_state'] == 'SP']
        result = sp_customers.merge(customer_order_counts, on='customer_id')
        result[result['order_count'] > 5]""",
        "file_type": "multiple",
        "notes": "Demonstrates multi-file query with filtering and aggregation"
    },
    {
        "query": "What's the time difference in days between order purchase and delivery for order ABC123?",
        "code": """# First check if the order exists and get timestamps
order_data = df[df['order_id'] == 'ABC123']
if len(order_data) > 0:
    # Convert to datetime and calculate difference in days
    purchase_date = pd.to_datetime(order_data['order_purchase_timestamp'].iloc[0], errors='coerce')
    delivery_date = pd.to_datetime(order_data['order_delivered_timestamp'].iloc[0], errors='coerce')
    if pd.notna(purchase_date) and pd.notna(delivery_date):
        (delivery_date - purchase_date).days
    else:
        "Purchase or delivery date is missing"
else:
    "Order not found" """,
        "file_type": "csv",
        "notes": "Example of safe date difference calculation for a specific order"
    },
    {
        "query": "What's the average time in days between order purchase and delivery?",
        "code": """# Calculate time difference between purchase and delivery for all orders
# First convert timestamps to datetime
df['purchase_date'] = pd.to_datetime(df['order_purchase_timestamp'], errors='coerce')
df['delivery_date'] = pd.to_datetime(df['order_delivered_timestamp'], errors='coerce')
# Calculate difference where both dates are available
df_valid = df.dropna(subset=['purchase_date', 'delivery_date'])
(df_valid['delivery_date'] - df_valid['purchase_date']).dt.days.mean()""",
        "file_type": "csv",
        "notes": "Example of safe date difference calculation across all orders"
    },
]

# Global vector store
vector_store = None

def find_examples(query, file_type=None, max_count=3):
    """Find relevant examples using vector similarity search"""
    global vector_store
    
    if vector_store is None:
        initialize_vector_store()
    results = vector_store.similarity_search(query, k=max_count*2)  
    examples = []
    for result in results:
        if result["metadata"]["type"] == "example":
            if file_type and result["metadata"].get("file_type") != "any" and result["metadata"].get("file_type") != file_type:
                continue
            examples.append(result["content"])
            if len(examples) >= max_count:
                break
                
    return examples

# Fallback if vector search fails
def _find_examples_keyword_fallback(query, file_type=None, max_count=3):
    if file_type:
        filtered = [ex for ex in query_examples 
                    if ex["file_type"] == file_type or ex["file_type"] == "any"]
    else:
        filtered = query_examples
    
    # simple word matching (not great but works for now)
    query_words = set(query.lower().split())
    matches = []
    for ex in filtered:
        ex_words = set(ex["query"].lower().split())
        common = query_words.intersection(ex_words)
        if len(common) > 0:
            score = len(common) / len(query_words)
            matches.append((score, ex))
    
    # Sort by score and take top N
    matches.sort(reverse=True)
    return [ex for _, ex in matches[:max_count]]

def initialize_vector_store():
    """Initialize the vector store with examples"""
    global vector_store
    
    vector_store = VectorStore()
    vector_store_dir = os.path.join(os.getcwd(), "vector_store")
    
    # Try to load existing store
    if os.path.exists(vector_store_dir):
        try:
            logger.info("Loading existing vector store...")
            vector_store.load(vector_store_dir)
            return
        except Exception as e:
            logger.error(f"Error loading vector store: {e}")
    
    # If loading fails or doesn't exist, create new store
    logger.info("Creating new vector store...")
    
    # Prepare metadata
    metadata_list = []
    for example in query_examples:
        metadata_list.append({
            "type": "example",
            "file_type": example.get("file_type", "any")
        })
    
    # Add pattern metadata
    for pattern in query_patterns:
        pattern_entry = {
            "query": f"How to {pattern['desc']}",
            "code": pattern.get("pandas", ""),
            "file_type": "any"
        }
        query_examples.append(pattern_entry)
        metadata_list.append({
            "type": "pattern",
            "file_type": "any"
        })
    
    # Add all documents to vector store
    vector_store.add_documents(query_examples, metadata_list)
    
    # Save to disk
    vector_store.save(vector_store_dir)

# Todo: draw this and include in evaluation/code structure part of paper
def get_file_connections(file_name):
    if file_name not in csv_files:
        return ""
    
    links = csv_files[file_name].get("links", [])
    if not links:
        return ""
    
    connections = f"\nConnections for {file_name}:\n"
    for link in links:
        connections += f"- Connected to {link['connects_to']} through {link['via']} ({link['type']})\n"
    return connections

def format_examples_for_prompt(examples):
    if not examples:
        return ""
    text = "\nSimilar questions I've answered before:\n"
    for i, ex in enumerate(examples, 1):
        text += f"{i}. Question: \"{ex['query']}\"\n"
        text += f"   Code: {ex['code']}\n\n"
    return text

def guess_relevant_files(query):
    relevance = {}
    for file_name, metadata in csv_files.items():
        relevance[file_name] = 0
        for col in metadata["columns"]:
            if col.lower() in query.lower():
                relevance[file_name] += 2
        for q in metadata["example_qs"]:
            q_words = set(q.lower().split())
            query_words = set(query.lower().split())
            matches = q_words.intersection(query_words)
            relevance[file_name] += len(matches) * 0.5
    
    relevant = [file for file, score in 
                     sorted(relevance.items(), key=lambda x: x[1], reverse=True) 
                     if score > 0]
    if not relevant:
        return list(csv_files.keys())
    return relevant

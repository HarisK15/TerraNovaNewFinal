
# RAG stuff for  CSV datasets
# Contains examples and metadata to help LLM understand dataset
# Tod: Add more examples, patterns if time

import random 

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
    }
]



    
# Todo: Replace with vector DB if time    
def find_examples(query, file_type=None, max_count=3):
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
        if common:
            matches.append({
                "example": ex,
                "score": len(common) / len(query_words)  
            })
    
    return [item["example"] for item in 
            sorted(matches, key=lambda x: x["score"], reverse=True)[:max_count]]

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

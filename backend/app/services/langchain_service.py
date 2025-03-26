from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
import re
from llama_index.llms.ollama import Ollama
import ollama
from langchain_core.messages import AIMessage
from langchain.chains import LLMChain
from langchain.schema.runnable import RunnableLambda
from app.utils.db_handler import get_database_schema
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# both initialized separately incase model needs to be changed later (particularly mistral for the pandas queries)
def initialize_langchain_service():
    csv_llm = ChatOllama(model="llama3")
    sql_llm = ChatOllama(model="llama3")

    return{"csv":csv_llm, "sql":sql_llm}




def get_sql_query(user_input, llm_model, db_path):
    sql_llm = llm_model["sql"]
    schema = get_database_schema(db_path)
    print(f"Extracted Schema: {schema}")
    # prompt engineering the llm to work better with dataset provided
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", f"""
            You are an SQL query generator. Your only job is to return a valid SQL query based on the user question.

        - Only return a valid SQL query. No explanations, extra text, or formatting.
        - The query must be inside triple backticks like this: ```sql ... ```
        - Always use `LOWER(column_name) = LOWER('value')` for text comparisons to ensure case-insensitive matching.
        - Always generate SQL queries that match actual database values.
        
        
        Example 1:
        User: "Get all employees earning over 50K."
        Response:
        SELECT * FROM employees WHERE salary > 50000;

        Example 2:
        User: "Find customers from New York"
        Response:
        SELECT * FROM customers WHERE city = 'New York';
        

        Make sure the response follows this format exactly. No extra text.
        - Do not modify column names or invent new values.
        - Ensure all generated queries match the exact city names in the database.


        Now, generate an SQL query for the following user input.
        """),
        # inject users input
        ("human", "{question}") 
    ])

    # Using langchain to connect the prompt engineering with the llm model
    chain = prompt_template | sql_llm
    llm_response = chain.invoke({"question": user_input})

    ai_text = str(llm_response).strip()

    sql_query = ai_text.replace("```sql", "").replace("```", "").strip()
    return sql_query




def get_pandas_query(user_input, llm_model):
    csv_llm = llm_model["csv"]

    # Prompt engineering the llm to work better with dataset proivded
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """
        You are a Pandas DataFrame query generator. Your job is to return a structured query.

        - Do not provide explanations.
        - Do not repeat the question.
        - The output must be a single valid Pandas query.
        - use `df[...]` as the format.
        - The query must end with a `]`.
        - The response must not contain triple backticks (```) or explanations.

        Example 1:
        User: "Find all students who scored more than 80."
        Response:
        df[df['mark'] > 80]


        Example 2:
        User: "Show all employees who are managers"
        Response:
        df[df['position'] == 'Manager']


        Now, generate a Pandas query for:
        """),
        ("human", "{question}")
    ])

    # Using langchain to connect the prompt engineering with the llm model 
    chain = prompt_template | csv_llm
    llm_response = chain.invoke({"question": user_input})
    ai_text = str(llm_response).strip()
    #manually get query incase llm fails
    match = re.search(r"df\[[^\]]+\]", ai_text)
    if match:
        pandas_query = match.group(0).strip()  
    else:
        pandas_query = ai_text.strip() 

    # not sure why this sometimes misses bracket but fixing it below
    if not pandas_query.endswith("]"):
        pandas_query += "]" 
    return pandas_query


if __name__ == "__main__":
    llm_models = initialize_langchain_service() 
    test_query = "Get the average salary per department, but only for departments with at least 5 employees"
    generated_sql = get_pandas_query(test_query, llm_models)
    logger.info(f"Generated SQL Query: {generated_sql}")
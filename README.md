# TerraNova Project:

This Code is part of my University dissertation, created by Haris Kamran (K21084769), supervised by Hector Menendez Benito



# Features:
- *Natural Language Querying*: Ask questions in plain English
- *Support for CSV & SQLite*: Import and upload your csv file (e.g the ones provided in the training set), or a sqlite3 database
- *Smart Visualizations*: Automatic charts based on your query results, if numeric values present
- *Export Options*: Export your results as Excel, CSV, or JSON
- *Responsive Design*: Works on MacOS, not tested on Windows or Linux



# Project Structure
The project consists of two main components:
- *Backend*: Python/Flask API with LLM integration for query processing
- *Frontend*: React application for the UI









# Getting Started

*Prerequisites*
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn


*Following to do in (bash) terminal*


# Setup Instructions

1. *Clone the Repository*

git clone https://github.com/Terranova-Projects/individualprojectcode-HarisK15.git
cd individualprojectcode-HarisK15






# Backend Setup

2. *Create and activate a virtual environment*:

   cd backend
   python -m venv venv
   
   If on Windows:
   venv\Scripts\activate
   
   If on macOS/Linux:
   source venv/bin/activate







3. *Install dependencies*:

   pip install -r requirements.txt








4. *Create a `.env` file in the backend directory with the following content:
   FLASK_ENV=development
   FLASK_APP=main.py
   OLLAMA_API_BASE_URL=http://localhost:11434
   MODEL_NAME=llama3
   
   Note: You will need to have Ollama running locally with the model mentioned above.
   If you don't have Ollama, you can download it from [https://ollama.ai/](https://ollama.ai/). Download any llama3 version with 3b parameter version, though if your machine supports it, you can use one with more parameters for better chatbot accuracy.





5. *Run the backend server*:
   (if not already, run the following -> cd backend)
   python main.py
   The backend API will be available at http://localhost:5000







# Frontend Setup


6. *Install dependencies*:
   cd frontend
   npm install





7. *Create a `.env` file in the frontend directory with:*
   REACT_APP_API_URL=http://localhost:5000





8. *Start the development server*:
   npm start
   The frontend application will be available at http://localhost:3000




# Using the app

1. Open the application in your browser at http://localhost:3000
2. Upload your CSV or database file
3. Start asking questions about your data
4. Explore the results and visualizations
5. Export your findings in your preferred format





## Troubleshooting

- If the backend fails to start, make sure the required ports are not in use.
- If you encounter CORS issues, verify that the frontend is communicating with the correct backend URL.
- For issues with file uploads, check that the `uploads` directory exists and has write permissions.




## License
- This Project belongs to Haris Kamran (K21084769), created for Terranova




## Acknowledgments
- This project was created as part of a dissertation project.
- Built with [React](https://reactjs.org/), [Material-UI](https://mui.com/), [Flask](https://flask.palletsprojects.com/), and [Ollama](https://ollama.ai/).
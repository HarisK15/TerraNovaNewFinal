import os
import pickle
import numpy as np
import faiss
import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Initialize the vector store with a sentence transformer model
class VectorStore:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.index = None
        self.documents = []
        
    def add_documents(self, documents, metadata_list=None):
        if not documents:
            return
            
        texts = [doc["query"] for doc in documents]
        embeddings = self.model.encode(texts)

        if self.index is None:
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dimension)
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings)
        
        for i, doc in enumerate(documents):
            self.documents.append({
                "content": doc,
                "metadata": metadata_list[i] if metadata_list else {}
            })
    
    # Search for similar documents based on vector similarity
    def similarity_search(self, query, k=3):
        query_embedding = self.model.encode([query])
        faiss.normalize_L2(query_embedding)
        distances, indices = self.index.search(query_embedding, k)
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.documents):
                result = self.documents[idx].copy()
                result["score"] = float(distances[0][i])
                results.append(result)
        return results
        
    def save(self, directory):
        os.makedirs(directory, exist_ok=True)
        faiss.write_index(self.index, os.path.join(directory, "index.faiss"))
        with open(os.path.join(directory, "documents.pkl"), "wb") as f:
            pickle.dump(self.documents, f)
            
    def load(self, directory):
        index_path = os.path.join(directory, "index.faiss")
        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
        else:
            raise FileNotFoundError(f"Index not found in {index_path}")
        docs_path = os.path.join(directory, "documents.pkl")
        if os.path.exists(docs_path):
            with open(docs_path, "rb") as f:
                self.documents = pickle.load(f)
        else:
            raise FileNotFoundError(f"Documents not found in {docs_path}")

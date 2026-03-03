import chromadb
from chromadb.utils import embedding_functions
from backend.config import settings

class VectorStore:

    def __init__(self):
        # The modern way to initialize ChromaDB
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PATH)

        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )

        self.collection = self.client.get_or_create_collection(
            name="guardgen",
            embedding_function=self.embedding_function
        )

    def add_documents(self, session_id: int, docs: list):
        # Prevent ChromaDB from crashing if there are no documents to add
        if not docs:
            print(f"No documents found for session {session_id}. Skipping vector insertion.")
            return

        ids = []
        documents = []
        metadatas = []

        for idx, doc in enumerate(docs):
            ids.append(f"{session_id}_{idx}")
            documents.append(doc["abstract"])
            metadatas.append({
                "title": doc["title"],
                "authors": doc["authors"],
                "session_id": session_id
            })

        self.collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )

    def query(self, text: str, n_results: int = 3):
        return self.collection.query(
            query_texts=[text],
            n_results=n_results
        )

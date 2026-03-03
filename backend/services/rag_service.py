#llam3 for llm based 

# import requests
# from backend.config import settings
# from backend.services.vector_store import VectorStore


# class RAGService:

#     def __init__(self):
#         self.vector_store = VectorStore()

#     def build_context(self, research_question: str):
#         results = self.vector_store.query(research_question)
#         context = ""

#         if results and "documents" in results:
#             for idx, doc in enumerate(results["documents"][0]):
#                 meta = results["metadatas"][0][idx]
#                 context += (
#                     f"\nSource {idx+1}: {meta['title']} by {meta['authors']}\n"
#                     f"{doc}\n"
#                 )
#         return context

#     def generate_prompt(self, research_question: str):
#         context = self.build_context(research_question)

#         prompt = f"""
# You are an academic research assistant that writes structured academic content.
# Use inline citations like: [Title, Author]

# Research Question:
# {research_question}

# Sources:
# {context}
# """

#         return prompt

#     def generate(self, research_question: str) -> str:
#         prompt = self.generate_prompt(research_question)
#         payload = {"prompt": prompt}

#         response = requests.post(settings.ZEPHYR_API_URL, json=payload)
#         response.raise_for_status()
#         return response.json().get("response", "")

#Hybrid Extractive Mode
import re
import requests
import numpy as np
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
from backend.config import settings
from backend.services.vector_store import VectorStore


class HybridRAGService:

    def __init__(self):
        self.vector_store = VectorStore()
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")

    # ---------------------------------------------------
    # Sentence Retrieval + Similarity Ranking
    # ---------------------------------------------------
    def retrieve_sentences(self, research_question, top_k_docs=5, top_k_sentences=15):

        results = self.vector_store.query(research_question, n_results=top_k_docs)

        sentences = []
        metadata = []

        if not results or "documents" not in results:
            return []

        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i]
            split_sentences = re.split(r'(?<=[.!?]) +', doc)

            for s in split_sentences:
                if len(s.strip()) > 20:
                    sentences.append(s.strip())
                    metadata.append(meta)

        if not sentences:
            return []

        question_embedding = self.embedder.encode([research_question])[0]
        sentence_embeddings = self.embedder.encode(sentences)

        similarities = np.dot(sentence_embeddings, question_embedding)

        top_indices = np.argsort(similarities)[-top_k_sentences:]

        selected = []
        for idx in top_indices:
            selected.append({
                "text": sentences[idx],
                "metadata": metadata[idx],
                "similarity": float(similarities[idx])
            })

        return selected

    # ---------------------------------------------------
    # Clustering into Thematic Sections
    # ---------------------------------------------------
    def cluster_sentences(self, selected_sentences, n_clusters=3):

        if not selected_sentences:
            return {}

        texts = [s["text"] for s in selected_sentences]
        embeddings = self.embedder.encode(texts)

        if len(texts) < n_clusters:
            n_clusters = len(texts)

        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        labels = kmeans.fit_predict(embeddings)

        clusters = {}
        for idx, label in enumerate(labels):
            clusters.setdefault(label, []).append(selected_sentences[idx])

        return clusters

    # ---------------------------------------------------
    # Inline Citation Injection
    # ---------------------------------------------------
    def inject_citation(self, sentence_obj):

        meta = sentence_obj["metadata"]
        author = meta.get("authors", "Unknown").split(",")[0]
        title = meta.get("title", "Unknown")

        citation = f"[{author}, {title[:40]}]"
        return f"{sentence_obj['text']} {citation}"

    # ---------------------------------------------------
    # Structured Draft Builder
    # ---------------------------------------------------
    def build_structured_draft(self, research_question):

        selected = self.retrieve_sentences(research_question)
        clusters = self.cluster_sentences(selected)

        draft = ""
        mapping = []

        section_titles = [
            "Background Context",
            "Key Findings",
            "Implications"
        ]

        for i, cluster_id in enumerate(clusters):

            draft += f"\n## {section_titles[i % len(section_titles)]}\n"

            for sentence_obj in clusters[cluster_id]:

                cited_sentence = self.inject_citation(sentence_obj)
                draft += cited_sentence + "\n"

                mapping.append({
                    "sentence": cited_sentence,
                    "source_title": sentence_obj["metadata"].get("title"),
                    "source_authors": sentence_obj["metadata"].get("authors"),
                    "similarity_score": round(sentence_obj["similarity"], 3)
                })

        return draft, mapping

    # ---------------------------------------------------
    # Hallucination Risk Score
    # ---------------------------------------------------
    def compute_hallucination_risk(self, draft, mapping):

        draft_sentences = re.split(r'(?<=[.!?]) +', draft)
        supported = len(mapping)
        total = len(draft_sentences)

        if total == 0:
            return 1.0

        support_ratio = supported / total
        hallucination_risk = round(1 - support_ratio, 3)

        return hallucination_risk

    # ---------------------------------------------------
    # Hybrid Generate
    # ---------------------------------------------------
    def generate(self, research_question):

        structured_draft, mapping = self.build_structured_draft(research_question)

        if not structured_draft:
            return {
                "draft": "No relevant content found.",
                "mapping": [],
                "hallucination_risk": 1.0
            }

        # Light editorial refinement only
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": f"Refine paragraph transitions only:\n\n{structured_draft}",
                "temperature": 0.3,
                "stream": False
            }
        )

        refined = response.json().get("response", structured_draft)

        hallucination_risk = self.compute_hallucination_risk(refined, mapping)

        return {
            "draft": refined,
            "mapping": mapping,
            "hallucination_risk": hallucination_risk
        }
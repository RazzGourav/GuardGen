import re
import json
import requests
from sqlalchemy.orm import Session
from backend.config import settings
from backend.models import Document


class ComplianceFilter:

    @staticmethod
    def bias_check(text: str):
        prompt = f"""
Analyze the following academic text.
Identify any biased, stereotyping, gendered, or unsubstantiated generalizations.

Return ONLY a JSON list of flagged phrases.

Text:
{text}
"""
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            }
        )

        try:
            return json.loads(response.json()["response"])
        except:
            return []

    @staticmethod
    def citation_check(text: str, db: Session, session_id: int):
        citations = re.findall(r'\[(.*?)\]', text)

        stored_docs = db.query(Document).filter(Document.session_id == session_id).all()
        stored_titles = [doc.title for doc in stored_docs]

        missing = []

        for citation in citations:
            found = any(citation_part in title for title in stored_titles for citation_part in citation.split(","))
            if not found:
                missing.append(citation)

        return missing

    @staticmethod
    def harmful_content_check(text: str):
        keywords = ["bomb", "kill", "weapon", "attack", "explosive"]

        flagged = [word for word in keywords if word in text.lower()]

        if flagged:
            return flagged

        return []
import requests
import random
from backend.config import settings


class Stylizer:

    @staticmethod
    def rewrite(text: str) -> str:

        structure_hint = random.choice([
            "Reorganize paragraphs to improve narrative progression.",
            "Improve logical flow while varying paragraph lengths.",
            "Adjust structure to make argument development feel more natural."
        ])

        tone_hint = random.choice([
            "Use a slightly reflective academic tone.",
            "Introduce subtle analytical commentary transitions.",
            "Balance analytical density with interpretive commentary."
        ])

        prompt = f"""
You are an academic editor improving a research draft.

Your task is to refine the text to enhance readability,
structural clarity, and rhetorical quality.

Guidelines:

1. Improve paragraph transitions.
2. Vary sentence lengths moderately.
3. Mix active and passive voice naturally.
4. Avoid overly repetitive phrasing.
5. Preserve ALL citations exactly as written.
6. Maintain academic integrity and factual correctness.
7. Do not fabricate new information.

Structure guidance:
{structure_hint}

Tone guidance:
{tone_hint}

Text:
{text}
"""

        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "temperature": 0.7,
                "top_p": 0.9,
                "stream": False
            }
        )

        return response.json()["response"]
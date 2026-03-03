# backend/routers/rag_stream.py

import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import requests
from backend.config import settings
from backend.services.rag_service import HybridRAGService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["RAG"])


def _stream_ollama(structured_draft: str):
    """Synchronous generator that yields tokens from Ollama streaming API."""
    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": f"Refine paragraph transitions only:\n\n{structured_draft}",
                "temperature": 0.3,
                "stream": True,
            },
            stream=True,
            timeout=120,
        )
        response.raise_for_status()

        for line in response.iter_lines():
            if not line:
                continue
            try:
                payload = json.loads(line.decode("utf-8"))
                token = payload.get("response", "")
                if token:
                    yield token
            except json.JSONDecodeError:
                continue
    except Exception as e:
        logger.error(f"Ollama streaming error: {e}")
        yield None  # sentinel for error


@router.websocket("/stream/{session_id}")
async def stream_draft(websocket: WebSocket, session_id: int):
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        question = data.get("research_question")

        if not question:
            await websocket.send_text("Error: Missing research_question")
            await websocket.close()
            return

        # Build structured draft (runs sync CPU work in thread pool)
        loop = asyncio.get_event_loop()
        rag = HybridRAGService()
        structured_draft, mapping = await loop.run_in_executor(
            None, rag.build_structured_draft, question
        )

        if not structured_draft:
            await websocket.send_text("No relevant content found.")
            await websocket.send_text("[DONE]")
            await websocket.close()
            return

        # Stream Ollama refinement tokens (blocking I/O in thread pool)
        token_count = 0
        for token in await loop.run_in_executor(
            None, lambda: list(_stream_ollama(structured_draft))
        ):
            if token is None:
                # Ollama error — fall back to raw structured draft
                logger.warning("Ollama stream failed, sending raw draft")
                await websocket.send_text(structured_draft)
                break
            await websocket.send_text(token)
            token_count += 1

        # If Ollama returned zero tokens, send the raw draft as fallback
        if token_count == 0:
            logger.warning("Ollama returned no tokens, sending raw draft")
            await websocket.send_text(structured_draft)

        await websocket.send_text("[DONE]")
        await websocket.close()

    except WebSocketDisconnect:
        logger.info(f"Client disconnected (session {session_id})")
    except Exception as e:
        logger.error(f"WebSocket stream error (session {session_id}): {e}")
        try:
            await websocket.send_text(f"Error: {str(e)}")
            await websocket.close()
        except:
            pass
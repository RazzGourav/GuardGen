#llama3 based

# from fastapi import APIRouter
# from backend.services.rag_service import RAGService
# from backend.schemas import DraftGenerateRequest

# router = APIRouter(prefix="/rag", tags=["RAG"])

# @router.post("/generate")
# def generate_draft(request: DraftGenerateRequest):
#     rag = RAGService()
#     draft = rag.generate_draft(request.research_question)
#     return {"draft": draft}

# from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# import requests
# import json
# from backend.services.rag_service import RAGService
# from backend.config import settings

# router = APIRouter(prefix="/rag", tags=["RAG"])


# # -------------------------
# # STREAMING ENDPOINT
# # -------------------------
# @router.websocket("/stream/{session_id}")
# async def stream_draft(websocket: WebSocket, session_id: int):
#     await websocket.accept()

#     try:
#         data = await websocket.receive_json()
#         research_question = data.get("research_question")

#         if not research_question:
#             await websocket.send_text("Error: Missing research_question")
#             await websocket.close()
#             return

#         rag = RAGService()
#         prompt = rag.generate_prompt(research_question)

#         response = requests.post(
#             f"{settings.OLLAMA_BASE_URL}/api/generate",
#             json={
#                 "model": settings.OLLAMA_MODEL,
#                 "prompt": prompt,
#                 "stream": True
#             },
#             stream=True,
#         )

#         for line in response.iter_lines():
#             if line:
#                 try:
#                     decoded = json.loads(line.decode("utf-8"))
#                     token = decoded.get("response", "")
#                     if token:
#                         await websocket.send_text(token)
#                 except json.JSONDecodeError:
#                     continue

#         await websocket.send_text("[DONE]")
#         await websocket.close()

#     except WebSocketDisconnect:
#         print("Client disconnected")
#     except Exception as e:
#         await websocket.send_text(f"Error: {str(e)}")
#         await websocket.close()


# # -------------------------
# # NON-STREAM FALLBACK
# # -------------------------
# @router.post("/generate")
# def generate_draft(request: dict):
#     research_question = request.get("research_question")

#     rag = RAGService()
#     prompt = rag.generate_prompt(research_question)

#     response = requests.post(
#         f"{settings.OLLAMA_BASE_URL}/api/generate",
#         json={
#             "model": settings.OLLAMA_MODEL,
#             "prompt": prompt,
#             "stream": False
#         },
#     )

#     return {"draft": response.json().get("response", "")}

#Hybrid structure
from fastapi import APIRouter
from backend.services.rag_service import HybridRAGService

router = APIRouter(prefix="/rag", tags=["Hybrid RAG"])


@router.post("/generate")
def generate_draft(request: dict):

    research_question = request.get("research_question")

    if not research_question:
        return {"error": "research_question required"}

    rag = HybridRAGService()
    result = rag.generate(research_question)

    return result
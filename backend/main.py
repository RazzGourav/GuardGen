from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine
from backend import models
from backend.routers import research
from backend.routers import filter
from backend.routers import rag
from backend.routers import rag_stream
from backend.routers import stylizer
import asyncio

app = FastAPI(title="GuardGen MVP")

# Create tables
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(filter.router)
app.include_router(research.router)
app.include_router(rag.router)
app.include_router(rag_stream.router)
@app.get("/health")
def health():
    return {"status": "ok"}
app.include_router(stylizer.router)

# Simple WebSocket progress broadcaster
connections = {}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int):
    await websocket.accept()
    connections[session_id] = websocket
    try:
        while True:
            await asyncio.sleep(1)
    except:
        connections.pop(session_id, None)


async def broadcast(session_id: int, message: str):
    ws = connections.get(session_id)
    if ws:
        await ws.send_text(message)
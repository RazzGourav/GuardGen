from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import ResearchSession, Document
from backend.schemas import SessionCreate, ResearchSearchRequest
from backend.services.research_service import ResearchService
from backend.services.vector_store import VectorStore

router = APIRouter(prefix="/research", tags=["Research"])


@router.post("/create")
def create_session(request: SessionCreate, db: Session = Depends(get_db)):
    session = ResearchSession(topic=request.topic)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/search")
def search(request: ResearchSearchRequest, db: Session = Depends(get_db)):
    papers = ResearchService.search_arxiv(request.query)
    ResearchService.save_results(db, request.session_id, papers)

    vector_store = VectorStore()
    vector_store.add_documents(request.session_id, papers)

    return {"papers_found": len(papers)}


@router.get("/documents/{session_id}")
def get_documents(session_id: int, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.session_id == session_id).all()
    return docs
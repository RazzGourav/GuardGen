from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Draft
from backend.schemas import StylizeRequest
from backend.services.rewrite_loop import RewriteLoop

router = APIRouter(prefix="/stylize", tags=["Stylizer"])


@router.post("/run")
def run_stylizer(request: StylizeRequest, db: Session = Depends(get_db)):

    result = RewriteLoop.humanize(request.text)

    draft = Draft(
        session_id=request.session_id,
        content=result["final_text"],
        ai_score=result["score"],
        iterations=result["iterations"]
    )

    db.add(draft)
    db.commit()

    return result


@router.get("/results/{session_id}")
def get_results(session_id: int, db: Session = Depends(get_db)):
    drafts = db.query(Draft).filter(Draft.session_id == session_id).all()
    return drafts
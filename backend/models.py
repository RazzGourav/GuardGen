from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from backend.database import Base


class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    status = Column(String, default="CREATED")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer)
    title = Column(String)
    authors = Column(String)
    abstract = Column(Text)


class Draft(Base):
    __tablename__ = "drafts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer)
    content = Column(Text)
    ai_score = Column(Float)
    iterations = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ComplianceReport(Base):
    __tablename__ = "compliance_reports"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer)
    report_json = Column(Text)
    overall_score = Column(Float)
    status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
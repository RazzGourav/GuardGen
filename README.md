# 🛡️ GuardGen — Grounded Research Synthesis Engine

> **Hybrid Extractive-Generative Research Assistant** — producing citation-grounded, traceable academic drafts with hallucination risk scoring and confidence visualization.

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VRAM: GTX 1650 Safe](https://img.shields.io/badge/VRAM-GTX%201650%20Safe-orange.svg)](#gpu-optimization)

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Key Differentiators](#key-differentiators)
4. [System Design](#system-design)
   - [High-Level Architecture](#high-level-architecture)
   - [Component Diagram](#component-diagram)
   - [Data Flow](#data-flow)
   - [Database Design](#database-design)
5. [Hybrid Extractive Pipeline](#hybrid-extractive-pipeline)
6. [Source Traceability Layer](#source-traceability-layer)
7. [Hallucination Risk Scoring](#hallucination-risk-scoring)
8. [Tech Stack](#tech-stack)
9. [GPU Optimization](#gpu-optimization)
10. [Installation](#installation)
11. [Configuration](#configuration)
12. [API Reference](#api-reference)
13. [Frontend Features](#frontend-features)
14. [Demo Flow](#demo-flow)
15. [Project Structure](#project-structure)
16. [Ethical Positioning](#ethical-positioning)
17. [Future Improvements](#future-improvements)
18. [License](#license)

---

## Overview

GuardGen is a **Hybrid Extractive-Generative Research Assistant** that bridges the gap between raw LLM generation and responsible academic writing. It produces structured, citation-grounded research drafts by prioritizing real human-written academic sources over free-form generative output.

Unlike pure LLM writing systems, GuardGen is built on five core pillars:

| Pillar | Description |
|--------|-------------|
| **Source Traceability** | Every sentence maps back to an originating academic document |
| **Sentence-Level Mapping** | Fine-grained tracking of which source supports which claim |
| **Citation Injection** | Automatic inline `[Author, Title]` citation insertion |
| **Hallucination Risk Estimation** | Quantitative scoring of unsupported content |
| **Confidence Heatmaps** | Visual rendering of semantic similarity strength |

This project is designed for **hackathon demonstration** and **responsible AI research workflows**.

---

## Problem Statement

Large Language Models (LLMs) can generate fluent academic text, but routinely fail in research contexts due to:

- **Hallucination** — generating plausible but unsupported claims
- **Weak source grounding** — no direct link between output and input documents
- **No traceability** — impossible to verify which source justifies which claim
- **Over-synthesis** — straying too far from actual document content
- **Opacity** — users have no visibility into generation confidence

### GuardGen's Solution

```
Hybrid Extractive Retrieval  +  Structured Synthesis  +  Minimal Generative Refinement
```

The system ensures the **majority of generated content originates from real human-written academic sources**, with generative components used only for light editorial smoothing — never for new information injection.

---

## Key Differentiators

| Feature | Traditional RAG | Pure LLM | **GuardGen** |
|---------|----------------|----------|--------------|
| Source Grounding | Partial | None | ✅ Sentence-level |
| Citation Injection | Manual | None | ✅ Automatic |
| Hallucination Score | None | None | ✅ Quantitative |
| Confidence Heatmap | None | None | ✅ Visual |
| Low VRAM Support | Varies | No | ✅ GTX 1650 Safe |
| Extractive-First | No | No | ✅ Yes |

---

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│              React 18 + TailwindCSS (Vite)                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP (Axios)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                            │
│   /research/search          /rag/generate                       │
└──────────┬───────────────────────────┬──────────────────────────┘
           │                           │
           ▼                           ▼
┌──────────────────┐       ┌───────────────────────────────────┐
│   ChromaDB       │       │     HYBRID EXTRACTIVE PIPELINE    │
│ Vector Store     │──────▶│                                   │
│ (Semantic Index) │       │  1. Document Retrieval            │
└──────────────────┘       │  2. Sentence-Level Extraction     │
                           │  3. Similarity Ranking            │
┌──────────────────┐       │  4. KMeans Clustering             │
│   SQLite         │       │  5. Citation Injection            │
│ Metadata Store   │       │  6. Draft Assembly                │
└──────────────────┘       └───────────────┬───────────────────┘
                                           │
                                           ▼
                           ┌───────────────────────────────────┐
                           │     LIGHT LLM EDITORIAL LAYER     │
                           │   Ollama + mistral:7b-instruct-q4 │
                           │   (transition smoothing only)     │
                           └───────────────┬───────────────────┘
                                           │
                                           ▼
                           ┌───────────────────────────────────┐
                           │  TRACEABILITY + SCORING ENGINE    │
                           │                                   │
                           │  • Sentence → Source Mapping      │
                           │  • Confidence Score per Sentence  │
                           │  • Hallucination Risk Calculation │
                           └───────────────┬───────────────────┘
                                           │
                                           ▼
                           ┌───────────────────────────────────┐
                           │       FRONTEND VISUALIZATION      │
                           │                                   │
                           │  • Draft Viewer                   │
                           │  • Confidence Heatmap             │
                           │  • Hallucination Risk Gauge       │
                           │  • Compliance Check Layer         │
                           └───────────────────────────────────┘
```

---

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GUARDGEN COMPONENTS                         │
│                                                                     │
│  ┌──────────────┐    ┌─────────────────┐    ┌────────────────────┐ │
│  │   Ingestion  │    │  Retrieval Core │    │  Synthesis Engine  │ │
│  │   Service    │    │                 │    │                    │ │
│  │              │    │  ChromaDB       │    │  Sentence Extractor│ │
│  │  - PDF Parse │───▶│  Vector Store   │───▶│  Similarity Ranker │ │
│  │  - Abstract  │    │                 │    │  KMeans Clusterer  │ │
│  │    Chunking  │    │  all-MiniLM-L6  │    │  Citation Injector │ │
│  │  - Embedding │    │  Embeddings     │    │  Draft Assembler   │ │
│  └──────────────┘    └─────────────────┘    └────────────┬───────┘ │
│                                                          │         │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────▼────────┐ │
│  │  Traceability│    │  Risk Scorer    │    │  LLM Refiner       │ │
│  │  Mapper      │    │                 │    │                    │ │
│  │              │    │  Hallucination  │◀───│  Ollama Runtime    │ │
│  │  Sentence ↔  │    │  Risk Formula   │    │  mistral:7b-q4     │ │
│  │  Source Map  │◀───│                 │    │  (Editorial Only)  │ │
│  │  Similarity  │    │  Confidence per │    │                    │ │
│  │  Scores      │    │  Sentence       │    └────────────────────┘ │
│  └──────┬───────┘    └────────┬────────┘                           │
│         │                    │                                     │
│         └──────────┬─────────┘                                     │
│                    ▼                                               │
│         ┌──────────────────────┐                                   │
│         │    API Response      │                                   │
│         │  { draft, mapping,   │                                   │
│         │    hallucination_    │                                   │
│         │    risk }            │                                   │
│         └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Data Flow

```
User Query
    │
    ▼
[1] QUERY EMBEDDING
    └── all-MiniLM-L6-v2 encodes query → 384-dim vector

    │
    ▼
[2] VECTOR SEARCH (ChromaDB)
    └── Top-K semantically relevant abstracts retrieved

    │
    ▼
[3] SENTENCE EXTRACTION
    └── Each abstract → split into sentences (filtered > 20 chars)
    └── Each sentence → embedded independently

    │
    ▼
[4] SIMILARITY RANKING
    └── Cosine similarity(sentence_vec, query_vec)
    └── Top-N sentences selected

    │
    ▼
[5] THEMATIC CLUSTERING (KMeans)
    └── Sentences grouped into K clusters (K = target section count)
    └── Cluster 0 → "Background Context"
    └── Cluster 1 → "Key Findings"
    └── Cluster 2 → "Implications"

    │
    ▼
[6] CITATION INJECTION
    └── Each sentence tagged: "[Author, Title]"
    └── Similarity score stored for heatmap

    │
    ▼
[7] DRAFT ASSEMBLY (Deterministic Templates)
    └── Sections built from cluster groups
    └── Structural coherence maintained

    │
    ▼
[8] LIGHT LLM REFINEMENT (Ollama)
    └── Transition smoothing between sentences
    └── NO new claims injected
    └── Temperature: 0.3–0.4

    │
    ▼
[9] SCORING
    └── Hallucination Risk = 1 - (supported_sentences / total_sentences)
    └── Per-sentence confidence scores attached to mapping[]

    │
    ▼
[10] API RESPONSE
    └── { draft, mapping[], hallucination_risk }
```

---

### Database Design

#### ChromaDB Collection Schema

```
Collection: "research_papers"

Document Fields:
  ├── id          : str  — unique paper identifier
  ├── document    : str  — abstract text
  └── metadata:
        ├── title   : str
        ├── authors : str
        ├── year    : int
        └── source  : str  — journal/conference name

Embedding Model: all-MiniLM-L6-v2 (384 dimensions)
Distance Metric: Cosine Similarity
```

#### SQLite Schema

```sql
CREATE TABLE papers (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    authors     TEXT NOT NULL,
    year        INTEGER,
    source      TEXT,
    abstract    TEXT,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sentence_map (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      TEXT NOT NULL,
    sentence_text   TEXT NOT NULL,
    source_paper_id TEXT NOT NULL,
    similarity_score REAL NOT NULL,
    cluster_id      INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_paper_id) REFERENCES papers(id)
);
```

---

## Hybrid Extractive Pipeline

GuardGen **does NOT rely on full LLM-based generation**. The pipeline is extractive-first, ensuring output fidelity to source documents.

### Stage 1 — Document Retrieval

- Uses **ChromaDB** for vector-indexed semantic search
- Query embedded using `all-MiniLM-L6-v2`
- Retrieves Top-K semantically relevant academic abstracts
- Metadata preserved: title, author, year, source

### Stage 2 — Sentence-Level Extraction

```
Abstract Text
    │
    ▼
Sentence Tokenizer (nltk / regex)
    │
    ▼
Filter: len(sentence) > 20 characters
    │
    ▼
Embed each sentence → 384-dim vector
```

### Stage 3 — Similarity Ranking

- Cosine similarity computed between each sentence and original query
- Sentences ranked by similarity score descending
- Top-N sentences selected (configurable, default N=20)

### Stage 4 — Thematic Clustering

```
KMeans(n_clusters=K)
    │
    ├── Cluster 0  →  Background Context
    ├── Cluster 1  →  Key Findings
    └── Cluster 2  →  Implications & Future Directions
```

Clusters are automatically labeled based on centroid distance and keyword heuristics. Section count K is adjustable per query.

### Stage 5 — Inline Citation Injection

Every sentence receives an automatic citation tag:

```
"[Sentence content here] [Author et al., Paper Title]"
```

This guarantees full citation transparency — no sentence appears without its source attribution.

### Stage 6 — Structured Draft Assembly

Draft sections are built via **deterministic template construction** — not generative. The template defines:

- Section heading
- Ordered sentences by similarity score within the cluster
- Transition placeholders for LLM smoothing pass

### Stage 7 — Light Editorial Refinement

A quantized local model performs **only** transition smoothing:

```python
SYSTEM_PROMPT = """
You are a copy editor. Your ONLY task is to smooth sentence transitions.
You MUST NOT:
- Add new claims
- Change factual content
- Remove citations
- Alter sentence meaning
"""
```

- Model: `mistral:7b-instruct-q4`
- Temperature: `0.3`
- Max tokens: `512` per section
- Runtime: Ollama (local, no API calls)

---

## Source Traceability Layer

Each generated sentence in the final draft carries a full provenance record:

```json
{
  "sentence": "Neural networks exhibit emergent capabilities at scale.",
  "source": {
    "title": "Emergent Abilities of Large Language Models",
    "authors": "Wei et al.",
    "year": 2022
  },
  "similarity_score": 0.847,
  "cluster": "Key Findings"
}
```

### Confidence Heatmap Rendering

The frontend renders a **per-sentence confidence heatmap** over the draft text:

```
Similarity Score  →  Visual Intensity
──────────────────────────────────────
  0.85 – 1.00    →  ████ Deep Purple (High Confidence)
  0.65 – 0.84    →  ███░ Medium Purple
  0.45 – 0.64    →  ██░░ Light Purple
  0.00 – 0.44    →  █░░░ Very Light (Low Confidence)
```

This allows reviewers and users to visually audit support strength at a glance, without reading every citation.

---

## Hallucination Risk Scoring

GuardGen computes a quantitative hallucination risk metric for every generated draft:

```
                    unsupported_sentences
Hallucination Risk = ─────────────────────────
                       total_sentences

Equivalently:

Hallucination Risk = 1 - (supported_sentences / total_sentences)
```

Where a sentence is considered **supported** if its similarity score exceeds a configurable threshold (default: `0.45`).

### Interpretation

| Risk Score    | Interpretation |
|---------------|----------------|
| `0.00 – 0.10` | 🟢 Excellent — nearly fully grounded |
| `0.11 – 0.25` | 🟡 Good — minor unsupported transitions |
| `0.26 – 0.45` | 🟠 Moderate — review recommended |
| `0.46+`       | 🔴 High — significant generative content |

Lower scores indicate more reliable, source-grounded output.

---

## Tech Stack

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| API Framework | FastAPI | REST endpoint serving |
| Metadata Store | SQLite | Paper and session metadata |
| Vector Store | ChromaDB | Semantic document retrieval |
| Embeddings | SentenceTransformers (`all-MiniLM-L6-v2`) | Sentence vectorization |
| Clustering | scikit-learn (`KMeans`) | Thematic grouping |
| LLM Runtime | Ollama | Local model execution |
| LLM Model | mistral:7b-instruct-q4 | Editorial refinement |
| Language | Python 3.11+ | Core runtime |

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| UI Framework | React 18 (Vite) | Component rendering |
| Styling | TailwindCSS | Utility-first CSS |
| HTTP Client | Axios | API communication |

### Infrastructure

| Component | Technology | Notes |
|-----------|-----------|-------|
| OS Target | WSL2 + Ubuntu 22.04 | Primary development target |
| GPU Support | NVIDIA GTX 1650+ | 4GB VRAM minimum |
| CPU Fallback | Full CPU mode | Embedding + clustering on CPU |

---

## GPU Optimization

GuardGen is specifically optimized for **consumer-grade GPUs (GTX 1650 / 4GB VRAM)**:

| Optimization | Detail |
|-------------|--------|
| Quantized model | `Q4_K_M` quantization (4-bit) |
| Low temperature | `0.3–0.4` — reduces sampling overhead |
| Token limit | Max 512 tokens per generation pass |
| CPU embedding | `all-MiniLM-L6-v2` runs fully on CPU |
| CPU clustering | KMeans runs fully on CPU |
| Minimal LLM passes | LLM called only for editorial smoothing |

**Typical generation time:** 5–10 seconds per complete draft

**Minimum hardware requirements:**

```
GPU:  NVIDIA GTX 1650 (4GB VRAM) or better
CPU:  4-core, 2.5GHz+
RAM:  8GB+
Disk: 10GB free (model weights + ChromaDB index)
```

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git
- NVIDIA GPU with CUDA (optional but recommended)
- WSL2 + Ubuntu 22.04 (recommended for Windows)

---

### Step 1 — Clone the Repository

```bash
git clone <repo-url>
cd guardgen
```

### Step 2 — Python Virtual Environment

```bash
python3.11 -m venv venv
source venv/bin/activate   # Linux/macOS/WSL
# venv\Scripts\activate    # Windows CMD

pip install --upgrade pip
pip install -r requirements.txt
```

**`requirements.txt` includes:**

```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
chromadb>=0.4.24
sentence-transformers>=2.6.1
scikit-learn>=1.4.0
numpy>=1.26.0
httpx>=0.27.0
python-multipart>=0.0.9
```

### Step 3 — Install Ollama + Pull Model

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull the quantized Mistral model
ollama pull mistral:7b-instruct-q4

# Verify installation
ollama list
```

### Step 4 — Initialize Database

```bash
python scripts/init_db.py
```

This creates the SQLite database and seeds the ChromaDB collection with sample academic abstracts for demonstration.

### Step 5 — Start the Backend

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend available at: `http://localhost:8000`  
API docs (Swagger): `http://localhost:8000/docs`

### Step 6 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## Configuration

Environment variables (create a `.env` file in the project root):

```env
# Backend
DATABASE_URL=sqlite:///./guardgen.db
CHROMA_PERSIST_DIR=./chroma_db
EMBEDDING_MODEL=all-MiniLM-L6-v2
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:7b-instruct-q4

# Pipeline tuning
TOP_K_DOCUMENTS=10          # Number of documents retrieved from ChromaDB
TOP_N_SENTENCES=20          # Number of sentences selected after ranking
N_CLUSTERS=3                # Number of thematic clusters (sections)
SIMILARITY_THRESHOLD=0.45   # Minimum score to count as "supported"
LLM_TEMPERATURE=0.3         # Generation temperature
LLM_MAX_TOKENS=512          # Max tokens per LLM refinement pass
```

---

## API Reference

### `POST /research/search`

Search the academic corpus for relevant papers.

**Request:**
```json
{
  "query": "transformer attention mechanisms in NLP",
  "top_k": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "paper_001",
      "title": "Attention Is All You Need",
      "authors": "Vaswani et al.",
      "year": 2017,
      "abstract": "...",
      "similarity_score": 0.923
    }
  ]
}
```

---

### `POST /rag/generate`

Generate a hybrid extractive-grounded research draft.

**Request:**
```json
{
  "query": "transformer attention mechanisms in NLP",
  "top_k": 10,
  "n_sentences": 20,
  "n_clusters": 3
}
```

**Response:**
```json
{
  "draft": "## Background Context\n\nThe transformer architecture...",
  "mapping": [
    {
      "sentence": "The transformer architecture introduced self-attention.",
      "source_title": "Attention Is All You Need",
      "source_authors": "Vaswani et al.",
      "similarity_score": 0.923,
      "cluster": "Background Context"
    }
  ],
  "hallucination_risk": 0.08,
  "stats": {
    "total_sentences": 24,
    "supported_sentences": 22,
    "unsupported_sentences": 2
  }
}
```

---

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "ollama": "connected",
  "chromadb": "connected"
}
```

---

## Frontend Features

| Feature | Description |
|---------|-------------|
| **Research Query Input** | Natural language query field with submit |
| **Hybrid Draft Viewer** | Rendered markdown draft with inline citations |
| **Inline Citations** | `[Author, Title]` appended to each sentence |
| **Confidence Heatmap** | Color-coded sentence background by similarity score |
| **Hallucination Risk Indicator** | Gauge/percentage display of risk score |
| **Compliance Check Layer** | Optional rule-based flagging of unsupported claims |
| **Stylizer** | Optional secondary LLM pass for tone adjustment |
| **Download** | Export final draft as `.txt` or `.md` |

---

## Demo Flow

The recommended 8-step demo sequence for hackathon presentation:

```
Step 1  →  Enter a research query
           Example: "transformer attention in NLP"

Step 2  →  Run research retrieval
           ChromaDB returns top-K semantically relevant abstracts

Step 3  →  Generate hybrid draft
           Pipeline runs: extract → rank → cluster → cite → assemble → refine

Step 4  →  Show inline citations
           Every sentence annotated with [Author, Title]

Step 5  →  Show confidence heatmap
           Color intensities reveal per-sentence similarity strength

Step 6  →  Show hallucination risk
           Quantitative score displayed prominently (e.g. 0.08 = 8% risk)

Step 7  →  Run compliance check
           Flags any sentence below similarity threshold

Step 8  →  Download final document
           Export grounded draft as markdown
```

---

## Project Structure

```
guardgen/
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── routers/
│   │   ├── research.py       # /research/search endpoint
│   │   └── rag.py            # /rag/generate endpoint
│   ├── services/
│   │   ├── retrieval.py      # ChromaDB search logic
│   │   ├── extraction.py     # Sentence extraction + embedding
│   │   ├── clustering.py     # KMeans thematic grouping
│   │   ├── citation.py       # Citation injection
│   │   ├── assembly.py       # Draft template construction
│   │   ├── refinement.py     # Ollama LLM editorial pass
│   │   └── scoring.py        # Hallucination risk + confidence
│   ├── models/
│   │   └── schemas.py        # Pydantic request/response models
│   └── db/
│       ├── database.py       # SQLite connection
│       └── chroma.py         # ChromaDB client
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueryInput.jsx
│   │   │   ├── DraftViewer.jsx
│   │   │   ├── HeatmapOverlay.jsx
│   │   │   ├── RiskGauge.jsx
│   │   │   └── CompliancePanel.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── scripts/
│   └── init_db.py            # DB initialization + sample seeding
├── chroma_db/                # ChromaDB persistence directory
├── guardgen.db               # SQLite database
├── requirements.txt
├── .env
└── README.md
```

---

## Ethical Positioning

GuardGen is **not** designed for adversarial use, academic fraud, or detection evasion.

Its purpose is the opposite: to make AI-assisted writing **more transparent, more auditable, and more trustworthy** than unconstrained LLM generation.

### Design Commitments

- **Grounded synthesis first** — LLM generation is a last-pass refinement, not the foundation
- **Transparent citation mapping** — every claim is linked to its source
- **Reduced hallucination** — quantitative risk scoring surfaces unsupported content
- **Explainable AI workflows** — heatmaps make confidence visible to any reviewer
- **Human oversight encouraged** — designed for use with a human researcher in the loop

> AI detectors are probabilistic classifiers and do not reliably determine authorship. GuardGen focuses on research integrity and traceability — producing output that is both accurate and verifiable.

---

## Future Improvements

| Feature | Priority | Description |
|---------|----------|-------------|
| Sentence-to-source explorer | High | Clickable sentences that expand to show full source abstract |
| Citation expansion panel | High | One-click popup with full paper metadata |
| Confidence explanation | Medium | Natural language explanation of why a sentence scored low |
| Reviewer simulation mode | Medium | Simulates academic peer reviewer critique |
| Academic export formatting | Medium | APA / MLA / Chicago formatted bibliography |
| Multi-document upload | High | Ingest user's own PDF library |
| Interactive cluster editor | Low | Manually re-assign sentences between sections |
| API rate limiting | Medium | Production-ready throttling |

---

## License

```
MIT License

Copyright (c) 2026 GuardGen Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

## Built For

```
🏆  Hackathons
🔬  AI Research Demonstrations
🛡️  Responsible AI Systems
📚  Academic Assistance (with human oversight)
```

---


*GuardGen — Because every claim deserves a source.*

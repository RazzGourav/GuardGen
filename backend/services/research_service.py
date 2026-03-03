import json
import redis
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import xml.etree.ElementTree as ET
from sqlalchemy.orm import Session
from backend.models import Document

ARXIV_API = "https://export.arxiv.org/api/query"

# Initialize the Redis client. 
# decode_responses=True automatically converts Redis byte responses back into Python strings.
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

class ResearchService:

    @staticmethod
    def get_requests_session():
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=1, 
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session

    @staticmethod
    def search_arxiv(query: str, max_results: int = 5):
        # --- 1. CACHE CHECK ---
        # Create a unique, predictable key for this specific search
        cache_key = f"arxiv_search:{query.lower().strip()}:{max_results}"
        
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                print(f"🟢 CACHE HIT: Returning fast results for '{query}'")
                return json.loads(cached_data)
        except redis.ConnectionError:
            print("🟡 REDIS WARNING: Cannot connect to Redis. Skipping cache check.")

        # --- 2. API FALLBACK ---
        print(f"🔴 CACHE MISS: Fetching '{query}' from arXiv API...")
        formatted_query = f'all:"{query}"'
        params = {"search_query": formatted_query, "start": 0, "max_results": max_results}
        headers = {"User-Agent": "GuardGen-MVP/0.1.0 (Python/Requests)"}

        session = ResearchService.get_requests_session()

        try:
            response = session.get(ARXIV_API, params=params, headers=headers, timeout=30)
            
            if response.status_code == 429:
                raise Exception("ArXiv API rate limit reached (Error 429). Please wait a few minutes before searching again.")
            elif response.status_code != 200:
                raise Exception(f"Failed to fetch arXiv data. Status: {response.status_code}, Detail: {response.text}")

            root = ET.fromstring(response.text)
            namespace = {"atom": "http://www.w3.org/2005/Atom"}

            results = []
            for entry in root.findall("atom:entry", namespace):
                title_elem = entry.find("atom:title", namespace)
                abstract_elem = entry.find("atom:summary", namespace)
                
                if title_elem is None or abstract_elem is None:
                    continue
                    
                title = title_elem.text.strip().replace('\n', ' ')
                abstract = abstract_elem.text.strip().replace('\n', ' ')
                
                authors = ", ".join(
                    author.find("atom:name", namespace).text
                    for author in entry.findall("atom:author", namespace)
                    if author.find("atom:name", namespace) is not None
                )

                results.append({"title": title, "abstract": abstract, "authors": authors})

            # --- 3. CACHE SAVE ---
            try:
                if results:
                    # Save the results in Redis for 24 hours (86400 seconds)
                    redis_client.setex(cache_key, 86400, json.dumps(results))
                    print(f"💾 Saved results for '{query}' to Redis.")
            except redis.ConnectionError:
                pass

            return results

        except requests.exceptions.Timeout:
            raise Exception("ArXiv API timed out after 30 seconds. The service might be under heavy load.")
        except requests.exceptions.RequestException as e:
            raise Exception(f"A network error occurred while reaching ArXiv: {str(e)}")

    @staticmethod
    def save_results(db: Session, session_id: int, papers: list):
        for paper in papers:
            doc = Document(
                session_id=session_id,
                title=paper["title"],
                abstract=paper["abstract"],
                authors=paper["authors"]
            )
            db.add(doc)
        db.commit()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from collections import defaultdict
import redis
import json
import time

load_dotenv()

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
r = redis.from_url(REDIS_URL, decode_responses=True)

app = FastAPI(
    title="HomeSync Recommender",
    description="Kullanıcı davranışına dayalı ürün öneri motoru (Redis Caching enabled)",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Models ────────────────────────────────────────────────────────────

class UserEventIn(BaseModel):
    category: str
    price: float
    event_type: str  # "view" | "cart" | "purchase"


class CandidateProduct(BaseModel):
    id: str
    isim: Optional[str] = ""
    fiyat: Optional[float] = 0
    kategori: Optional[str] = "Genel"
    gorsel_url: Optional[str] = ""
    aciklama: Optional[str] = ""
    stok_adedi: Optional[int] = 0


class RecommendRequest(BaseModel):
    user_id: str
    events: List[UserEventIn]
    candidate_products: List[CandidateProduct]
    bypass_cache: Optional[bool] = False


class RecommendResponse(BaseModel):
    recommendations: List[CandidateProduct]
    profile: dict
    cache_hit: Optional[bool] = False
    latency_ms: Optional[float] = None


# ── Scoring Logic ──────────────────────────────────────────────────────────────

EVENT_WEIGHTS = {
    "purchase": 5.0,
    "cart":     3.0,
    "view":     1.0,
}


def build_user_profile(events: List[UserEventIn]) -> dict:
    """
    Returns:
      category_scores  — weighted frequency per category
      avg_price        — weighted average price the user engages with
      price_range      — (min, max) observed price with purchase/cart weight
    """
    category_scores: dict[str, float] = defaultdict(float)
    price_sum = 0.0
    price_weight_total = 0.0
    price_samples: list[float] = []

    for event in events:
        weight = EVENT_WEIGHTS.get(event.event_type, 1.0)
        category_scores[event.category] += weight

        if event.price > 0:
            price_sum += event.price * weight
            price_weight_total += weight
            price_samples.append(event.price)

    avg_price = price_sum / price_weight_total if price_weight_total > 0 else None
    price_range = (min(price_samples), max(price_samples)) if price_samples else None

    return {
        "category_scores": dict(category_scores),
        "avg_price": avg_price,
        "price_range": price_range,
    }


def score_product(product: CandidateProduct, profile: dict) -> float:
    """
    Scores a candidate product against the user profile.
    Higher = more relevant.
    """
    score = 0.0

    # Category affinity (primary signal)
    cat_scores = profile.get("category_scores", {})
    score += cat_scores.get(product.kategori or "Genel", 0.0) * 10.0

    # Price proximity (secondary signal)
    avg_price = profile.get("avg_price")
    if avg_price and product.fiyat and product.fiyat > 0:
        ratio = min(product.fiyat, avg_price) / max(product.fiyat, avg_price)
        score += ratio * 5.0  # 0 → 5 points based on how close the price is

    # Stock bonus — prefer in-stock
    if product.stok_adedi and product.stok_adedi > 10:
        score += 1.0

    return score


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "homesync-recommender"}


from .recommender_logic import engine

# ... (Existing models) ...

@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    start_time = time.time()
    
    # Cache Key for final results
    cache_key = f"user:{req.user_id}:recs"
    
    # Layer 3 Cache Check
    if not req.bypass_cache:
        cached_recs = r.get(cache_key)
        if cached_recs:
            return RecommendResponse(
                recommendations=json.loads(cached_recs),
                profile={}, 
                cache_hit=True,
                latency_ms=(time.time() - start_time) * 1000
            )

    # Layer 1 Cache Check (User Profile)
    profile_key = f"user:{req.user_id}:profile"
    cached_profile = r.get(profile_key)
    profile = None
    
    if cached_profile and not req.bypass_cache:
        profile = json.loads(cached_profile)
    
    # Prepare features for candidates
    candidate_dicts = [p.dict() for p in req.candidate_products]
    engine.prepare_content_features(candidate_dicts)
    
    # Check for "seed" interaction
    seed_ids = [e.category for e in req.events if e.event_type in ["purchase", "cart"]]
    
    if seed_ids:
        # Complex scoring (Lookalike)
        recommendations = engine.get_lookalikes(seed_ids, candidate_dicts, top_k=8)
        rec_models = [CandidateProduct(**p) for p in recommendations]
    else:
        # Fallback to heuristic scoring
        if not profile:
            profile = build_user_profile(req.events)
            r.setex(profile_key, 1800, json.dumps(profile)) # 30 min TTL
        
        scored = [
            (product, score_product(product, profile))
            for product in req.candidate_products
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
        rec_models = [p for p, _ in scored[:8]]

    # Cache Final Results (Layer 3)
    r.setex(cache_key, 300, json.dumps([p.dict() for p in rec_models])) # 5 min TTL
    
    return RecommendResponse(
        recommendations=rec_models,
        profile=profile or build_user_profile(req.events),
        cache_hit=False,
        latency_ms=(time.time() - start_time) * 1000
    )

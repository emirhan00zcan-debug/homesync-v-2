import numpy as np
import torch
import torch.nn as nn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional

# ── Neural Collaborative Filtering Model ──────────────────────────────────────

class NCFModel(nn.Module):
    """
    Neural Collaborative Filtering (NCF) Model for Professional Recommendations.
    """
    def __init__(self, num_users: int, num_profs: int, embed_size: int = 64):
        super().__init__()
        self.user_embed = nn.Embedding(num_users, embed_size)
        self.prof_embed = nn.Embedding(num_profs, embed_size)
        
        self.fc_layers = nn.Sequential(
            nn.Linear(embed_size * 2, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, user_indices: torch.Tensor, prof_indices: torch.Tensor) -> torch.Tensor:
        u_emb = self.user_embed(user_indices)
        p_emb = self.prof_embed(prof_indices)
        x = torch.cat([u_emb, p_emb], dim=-1)
        return self.fc_layers(x)

# ── Feature Engineering ───────────────────────────────────────────────────────

class RecommenderEngine:
    def __init__(self):
        self.tfidf = TfidfVectorizer(stop_words='english')  # Adjust for Turkish if needed
        self.scaler = MinMaxScaler()
        self.content_matrix = None
        self.prof_id_map = {}

    def prepare_content_features(self, profiles: List[Dict[str, Any]]):
        """
        Creates a content-based feature matrix for Cold Start scenarios.
        """
        if not profiles:
            return None
            
        bios = [p.get('aciklama', '') for p in profiles]
        skill_vectors = self.tfidf.fit_transform(bios).toarray()
        
        numeric_data = [
            [float(p.get('fiyat', 0)), float(p.get('stok_adedi', 0))]
            for p in profiles
        ]
        scaled_numeric = self.scaler.fit_transform(numeric_data)
        
        self.content_matrix = np.hstack((skill_vectors, scaled_numeric))
        self.prof_id_map = {p['id']: i for i, p in enumerate(profiles)}
        return self.content_matrix

    def get_lookalikes(self, seed_prof_ids: List[str], candidate_profiles: List[Dict[str, Any]], top_k: int = 5):
        """
        Meta-style Lookalike logic using Centroid Similarity.
        """
        if self.content_matrix is None or not seed_prof_ids:
            return candidate_profiles[:top_k]

        # Calculate centroid of seed professionals
        seed_indices = [self.prof_id_map[sid] for sid in seed_prof_ids if sid in self.prof_id_map]
        if not seed_indices:
            return candidate_profiles[:top_k]
            
        seed_vectors = self.content_matrix[seed_indices]
        centroid = np.mean(seed_vectors, axis=0)
        
        # Calculate similarity of all candidates to centroid
        similarities = cosine_similarity([centroid], self.content_matrix)[0]
        
        # Sort and return candidates
        scored_candidates = []
        for i, similarity in enumerate(similarities):
            prof_id = list(self.prof_id_map.keys())[list(self.prof_id_map.values()).index(i)]
            # Find the original product/professional object
            orig = next((p for p in candidate_profiles if p['id'] == prof_id), None)
            if orig:
                scored_candidates.append((orig, similarity))
        
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        return [p for p, s in scored_candidates[:top_k]]

# Singleton instance
engine = RecommenderEngine()

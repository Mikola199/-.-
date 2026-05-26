from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="NeoSuperApp AI Service")

class ModerationRequest(BaseModel):
    text: str

class Listing(BaseModel):
    id: str
    title: str
    price: float
    city: str
    category: str
    aiScore: float

class RecommendationRequest(BaseModel):
    listingPool: List[Listing]
    city: str
    favorites: List[str]

@app.post("/moderate")
async def moderate(data: ModerationRequest):
    banned_words = ['скам', 'обман']
    found = [word for word in banned_words if word in data.text.lower()]
    if found:
        return {"approved": False, "reason": f"Найдено подозрительное слово: {found[0]}"}
    return {"approved": True, "reason": "Объявление прошло AI-модерацию."}

@app.post("/recommend")
async def recommend(data: RecommendationRequest):
    scored = []
    for item in data.listingPool:
        score = item.aiScore
        if item.city == data.city:
            score += 6
        if item.category in data.favorites:
            score += 10
        scored.append({"listing": item, "score": score})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return [entry["listing"] for entry in scored[:6]]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)

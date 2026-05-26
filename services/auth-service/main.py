import os
from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import Optional
from jose import jwt
from passlib.context import CryptContext

app = FastAPI(title="NeoSuperApp Auth Service")

SECRET_KEY = os.getenv("JWT_SECRET", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginSchema(BaseModel):
    email: str
    password: str

def create_access_token(data: dict):
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/login")
async def login(data: LoginSchema):
    # In a real app, verify password against DB
    user_id = "u1"
    access_token = create_access_token(data={"sub": user_id, "email": data.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user_id, "email": data.email}}

@app.post("/register")
async def register(data: LoginSchema):
    # In a real app, hash password and save to DB
    user_id = "u2"
    access_token = create_access_token(data={"sub": user_id, "email": data.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user_id, "email": data.email}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

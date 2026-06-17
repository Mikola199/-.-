from fastapi import FastAPI, Request, HTTPException
import httpx
import os

app = FastAPI(title="GLock Connect API Gateway")

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")

@app.all("/{path:path}")
async def gateway(request: Request, path: str):
    async with httpx.AsyncClient() as client:
        url = f"{AUTH_SERVICE_URL}/{path}"

        # Simple routing logic for demonstration
        # In production, this would be more sophisticated with service discovery

        method = request.method
        content = await request.body()
        headers = dict(request.headers)
        # Remove host header to avoid issues with target service
        headers.pop("host", None)

        try:
            response = await client.request(
                method,
                url,
                content=content,
                headers=headers,
                params=request.query_params
            )
            return response.json() if response.headers.get("content-type") == "application/json" else response.content
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Error connecting to service: {exc}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

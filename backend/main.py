import json

from fastapi import FastAPI, Request, UploadFile, File, HTTPException
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import os

from rag import init_db, close_db, ingest_document, build_rag_context, list_documents, delete_document

app = FastAPI()


origins = [
    "http://localhost",         
    "http://127.0.0.1",       
    "http://localhost:5173",   
    "http://127.0.0.1:5173",
    "http://localhost:80",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],         
)

class ChatMessage(BaseModel):
    message: str

OLLAMA_API = os.getenv("OLLAMA_API", "http://localhost:11434")


@app.on_event("startup")
async def startup():
    await init_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()


@app.get("/")
async def root():
    return {"status": "Backend läuft", "engine": "Ollama ready"}


# ---------------------------------------------------------------------------
# Dokument-Upload & Verwaltung
# ---------------------------------------------------------------------------

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Lädt ein Dokument hoch und speichert es in der RAG-Pipeline."""
    allowed_extensions = {"pdf", "docx", "txt", "md", "csv", "json", "xml", "html"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Dateiformat .{ext} nicht unterstützt. Erlaubt: {', '.join(allowed_extensions)}",
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Die Datei ist leer.")
    if len(file_bytes) > 50 * 1024 * 1024:  # 50 MB Limit
        raise HTTPException(status_code=400, detail="Datei zu groß (max. 50 MB).")

    try:
        result = await ingest_document(file.filename, file_bytes)
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents")
async def get_documents():
    """Listet alle hochgeladenen Dokumente auf."""
    docs = await list_documents()
    return {"documents": docs}


@app.delete("/documents/{filename}")
async def remove_document(filename: str):
    """Löscht ein Dokument aus der RAG-Datenbank."""
    deleted = await delete_document(filename)
    if not deleted:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden.")
    return {"status": "deleted", "filename": filename}


# ---------------------------------------------------------------------------
# Chat mit RAG-Kontext
# ---------------------------------------------------------------------------


async def stream_response(prompt: str, request: Request):
    # RAG-Kontext abrufen
    try:
        rag_context = await build_rag_context(prompt)
    except Exception as e:
        print(f"RAG-Kontext konnte nicht abgerufen werden: {e}")
        rag_context = ""

    if rag_context:
        augmented_prompt = (
            "Beantworte die folgende Frage basierend auf dem bereitgestellten Kontext. "
            "Wenn der Kontext nicht ausreicht, nutze dein allgemeines Wissen, aber weise darauf hin.\n\n"
            f"--- KONTEXT ---\n{rag_context}\n--- ENDE KONTEXT ---\n\n"
            f"Frage: {prompt}"
        )
    else:
        augmented_prompt = prompt

    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("POST",
                f"{OLLAMA_API}/api/generate",
                json={
                    "model": "llama3.2",
                    "prompt": augmented_prompt,
                    "stream": True,
                    "options": {
                        "num_ctx": 8192
                    }
                },
                timeout=None
            ) as response:
                async for line in response.aiter_lines():
                    if await request.is_disconnected():
                        print("Client hat die Verbindung getrennt")
                        return
                    if line:
                        chunk = json.loads(line)
                        if chunk.get("error"):
                            print(f"Ollama Fehler: {chunk['error']}")
                            yield f"\n\n[Fehler: {chunk['error']}]"
                            return
                        yield chunk.get("response", "")
                        if chunk.get("done"):
                            break
        except Exception as e:
            print(f"Fehler bei der Anfrage an Ollama: {e}")
            yield "\n\n[Fehler: Verbindung zu Ollama fehlgeschlagen]"


@app.post("/chat")
async def chat(data: ChatMessage, request: Request):
    return StreamingResponse(
        stream_response(data.message, request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "X-Content-Type-Options": "nosniff",
        },
    )



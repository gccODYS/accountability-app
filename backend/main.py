from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas, crud
from app.database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Journal API", version="1.0.0")

# Allow React Native app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Root endpoint - API status"""
    return {"message": "AI Journal API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/api/journals", response_model=schemas.Journal)
def create_journal(journal: schemas.JournalCreate, db: Session = Depends(get_db)):
    """
    Create a new journal entry or update if client_id already exists.

    This endpoint implements upsert behavior:
    - If a journal with the given client_id exists, it will be updated
    - If not, a new journal will be created

    This allows offline-first sync where the frontend generates IDs.
    """
    return crud.create_journal(db=db, journal=journal)

@app.get("/api/journals", response_model=schemas.JournalListResponse)
def get_journals(
    since: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all journal entries, optionally filtered by timestamp.

    Args:
        since: Optional timestamp (milliseconds) to get journals created after
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (default 100)

    Returns:
        List of journals sorted by timestamp descending and total count
    """
    journals = crud.get_journals(db, since=since, skip=skip, limit=limit)
    count = crud.get_journals_count(db)
    return {"journals": journals, "count": count}

@app.get("/api/journals/{client_id}", response_model=schemas.Journal)
def get_journal(client_id: str, db: Session = Depends(get_db)):
    """
    Get a specific journal entry by client_id.

    Args:
        client_id: Unique client-generated ID

    Returns:
        Journal object

    Raises:
        HTTPException: 404 if journal not found
    """
    db_journal = crud.get_journal_by_client_id(db, client_id=client_id)
    if db_journal is None:
        raise HTTPException(status_code=404, detail="Journal not found")
    return db_journal

@app.put("/api/journals/{client_id}", response_model=schemas.Journal)
def update_journal(
    client_id: str,
    journal_update: schemas.JournalUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing journal entry.

    Args:
        client_id: Unique client-generated ID
        journal_update: Fields to update

    Returns:
        Updated journal object

    Raises:
        HTTPException: 404 if journal not found
    """
    db_journal = crud.update_journal(db, client_id=client_id, journal_update=journal_update)
    if db_journal is None:
        raise HTTPException(status_code=404, detail="Journal not found")
    return db_journal

@app.delete("/api/journals/{client_id}")
def delete_journal(client_id: str, db: Session = Depends(get_db)):
    """
    Delete a journal entry.

    Args:
        client_id: Unique client-generated ID

    Returns:
        Success message

    Raises:
        HTTPException: 404 if journal not found
    """
    success = crud.delete_journal(db, client_id=client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Journal not found")
    return {"success": True, "message": "Journal deleted successfully"}

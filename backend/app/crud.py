from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

def get_journal_by_client_id(db: Session, client_id: str) -> Optional[models.Journal]:
    """
    Get a journal entry by its client_id.

    Args:
        db: Database session
        client_id: Unique client-generated ID

    Returns:
        Journal object if found, None otherwise
    """
    return db.query(models.Journal).filter(models.Journal.client_id == client_id).first()

def get_journals(db: Session, since: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[models.Journal]:
    """
    Get all journal entries, optionally filtered by timestamp.

    Args:
        db: Database session
        since: Optional timestamp (milliseconds) to get journals created after
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return

    Returns:
        List of Journal objects sorted by timestamp descending
    """
    query = db.query(models.Journal)

    if since is not None:
        query = query.filter(models.Journal.timestamp > since)

    return query.order_by(models.Journal.timestamp.desc()).offset(skip).limit(limit).all()

def create_journal(db: Session, journal: schemas.JournalCreate) -> models.Journal:
    """
    Create a new journal entry or update if client_id already exists (upsert).

    Args:
        db: Database session
        journal: Journal data from request

    Returns:
        Created or updated Journal object
    """
    # Check if journal with this client_id already exists
    existing_journal = get_journal_by_client_id(db, journal.client_id)

    if existing_journal:
        # Update existing journal
        existing_journal.prompt = journal.prompt
        existing_journal.text = journal.text
        existing_journal.timestamp = journal.timestamp
        db.commit()
        db.refresh(existing_journal)
        return existing_journal
    else:
        # Create new journal
        db_journal = models.Journal(
            client_id=journal.client_id,
            prompt=journal.prompt,
            text=journal.text,
            timestamp=journal.timestamp
        )
        db.add(db_journal)
        db.commit()
        db.refresh(db_journal)
        return db_journal

def update_journal(db: Session, client_id: str, journal_update: schemas.JournalUpdate) -> Optional[models.Journal]:
    """
    Update an existing journal entry.

    Args:
        db: Database session
        client_id: Client ID of journal to update
        journal_update: Updated journal data

    Returns:
        Updated Journal object if found, None otherwise
    """
    db_journal = get_journal_by_client_id(db, client_id)
    if db_journal is None:
        return None

    update_data = journal_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_journal, field, value)

    db.commit()
    db.refresh(db_journal)
    return db_journal

def delete_journal(db: Session, client_id: str) -> bool:
    """
    Delete a journal entry.

    Args:
        db: Database session
        client_id: Client ID of journal to delete

    Returns:
        True if deleted, False if not found
    """
    db_journal = get_journal_by_client_id(db, client_id)
    if db_journal is None:
        return False

    db.delete(db_journal)
    db.commit()
    return True

def get_journals_count(db: Session) -> int:
    """
    Get total count of all journal entries.

    Args:
        db: Database session

    Returns:
        Total number of journals
    """
    return db.query(models.Journal).count()

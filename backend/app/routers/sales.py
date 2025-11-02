from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/sales",
    tags=["sales"]
)

@router.post("/", response_model=schemas.Sale, status_code=201)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    """
    Record a new sale. This will:
    - Create a sale record
    - Decrease product stock
    - Update stock history
    """
    try:
        return crud.create_sale(db, sale)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.Sale])
def get_sales(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Get list of recent sales"""
    return crud.get_sales(db, skip, limit)

@router.get("/{sale_id}", response_model=schemas.Sale)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    """Get a specific sale by ID"""
    from ..models import Sale
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
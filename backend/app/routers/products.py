from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.post("/", response_model=schemas.Product, status_code=201)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    return crud.create_product(db, product)

@router.get("/", response_model=schemas.PaginatedProducts)
def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated list of products with optional category filter"""
    skip = (page - 1) * per_page
    products = crud.get_products(db, skip=skip, limit=per_page, category=category)
    total = crud.get_products_count(db, category=category)
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "products": products
    }

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update a product"""
    updated = crud.update_product(db, product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product"""
    success = crud.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@router.post("/{product_id}/restock")
def restock_product(
    product_id: int,
    quantity: int = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    """Add stock to a product"""
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    new_stock = product.stock + quantity
    updated = crud.update_product(
        db, 
        product_id, 
        schemas.ProductUpdate(stock=new_stock)
    )
    
    return {
        "message": f"Restocked {quantity} units",
        "previous_stock": product.stock,
        "new_stock": updated.stock
    }
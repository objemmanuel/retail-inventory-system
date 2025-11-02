"""
Create this as backend/app/routers/barcode.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from .. import models, schemas, crud
import random
import string

router = APIRouter(
    prefix="/barcode",
    tags=["barcode"]
)

class BarcodeSearch(BaseModel):
    barcode: str

class BarcodeGenerate(BaseModel):
    product_id: int

@router.post("/search")
def search_by_barcode(
    search: BarcodeSearch,
    db: Session = Depends(get_db)
):
    """Search product by barcode"""
    product = db.query(models.Product).filter(
        models.Product.barcode == search.barcode
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "id": product.id,
        "name": product.name,
        "category": product.category,
        "stock": product.stock,
        "price": product.price,
        "barcode": product.barcode,
        "sku": product.sku
    }

@router.post("/generate")
def generate_barcode(
    data: BarcodeGenerate,
    db: Session = Depends(get_db)
):
    """Generate barcode for a product"""
    product = crud.get_product(db, data.product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.barcode:
        return {
            "message": "Product already has barcode",
            "barcode": product.barcode
        }
    
    # Generate unique barcode (EAN-13 format simulation)
    while True:
        barcode = ''.join(random.choices(string.digits, k=13))
        existing = db.query(models.Product).filter(
            models.Product.barcode == barcode
        ).first()
        if not existing:
            break
    
    # Update product
    product.barcode = barcode
    if not product.sku:
        product.sku = f"SKU-{product.id:06d}"
    
    db.commit()
    
    return {
        "message": "Barcode generated successfully",
        "product_id": product.id,
        "barcode": barcode,
        "sku": product.sku
    }

@router.post("/quick-sale")
def quick_sale_by_barcode(
    barcode: str,
    quantity: int = 1,
    db: Session = Depends(get_db)
):
    """Create sale using barcode scanner"""
    # Find product
    product = db.query(models.Product).filter(
        models.Product.barcode == barcode
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Create sale
    sale_data = schemas.SaleCreate(
        product_id=product.id,
        quantity=quantity
    )
    
    try:
        sale = crud.create_sale(db, sale_data)
        return {
            "success": True,
            "sale_id": sale.id,
            "product_name": product.name,
            "quantity": quantity,
            "total_amount": sale.total_amount,
            "remaining_stock": product.stock
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/inventory-check/{barcode}")
def check_inventory_by_barcode(
    barcode: str,
    db: Session = Depends(get_db)
):
    """Quick inventory check using barcode"""
    product = db.query(models.Product).filter(
        models.Product.barcode == barcode
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "product_name": product.name,
        "current_stock": product.stock,
        "reorder_level": product.reorder_level,
        "status": "low_stock" if product.stock <= product.reorder_level else "in_stock",
        "price": product.price
    }
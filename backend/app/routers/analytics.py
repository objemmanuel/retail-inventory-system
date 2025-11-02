from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db
from ..ml_model import stock_predictor

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

@router.get("/low-stock", response_model=List[schemas.Product])
def get_low_stock_products(db: Session = Depends(get_db)):
    """Get all products with stock at or below reorder level"""
    return crud.get_low_stock_products(db)

@router.get("/top-selling")
def get_top_selling_products(
    limit: int = 10, 
    days: int = 30, 
    db: Session = Depends(get_db)
):
    """Get top selling products within specified time period"""
    results = crud.get_top_selling_products(db, limit, days)
    return [
        {"id": r[0], "name": r[1], "total_sold": r[2]}
        for r in results
    ]

@router.get("/stock-history/{product_id}", response_model=List[schemas.StockHistoryEntry])
def get_product_stock_history(
    product_id: int, 
    days: int = 30, 
    db: Session = Depends(get_db)
):
    """Get stock level history for a product"""
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return crud.get_stock_history(db, product_id, days)

@router.get("/predictions/{product_id}")
def predict_product_stockout(product_id: int, db: Session = Depends(get_db)):
    """Get ML prediction for when product will run out of stock"""
    prediction = stock_predictor.predict_stockout_date(db, product_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Product not found")
    return prediction

@router.get("/predictions/")
def predict_all_stockouts(db: Session = Depends(get_db)):
    """Get stockout predictions for all products"""
    return stock_predictor.get_all_predictions(db)

@router.get("/dashboard-stats")
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Get aggregated statistics for dashboard"""
    from sqlalchemy import func
    from ..models import Product, Sale
    from datetime import datetime, timedelta
    
    total_products = db.query(func.count(Product.id)).scalar()
    low_stock_count = db.query(func.count(Product.id)).filter(
        Product.stock <= Product.reorder_level
    ).scalar()
    
    # Sales in last 30 days
    cutoff = datetime.utcnow() - timedelta(days=30)
    recent_sales = db.query(func.sum(Sale.total_amount)).filter(
        Sale.sale_date >= cutoff
    ).scalar() or 0
    
    # Categories
    categories = db.query(Product.category).distinct().all()
    
    return {
        "total_products": total_products,
        "low_stock_count": low_stock_count,
        "categories_count": len(categories),
        "revenue_30_days": float(recent_sales),
        "categories": [c[0] for c in categories]
    }
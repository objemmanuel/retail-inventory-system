from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from . import models, schemas
from datetime import datetime, timedelta
from typing import Optional

# Product CRUD
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 10, category: Optional[str] = None):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category == category)
    return query.offset(skip).limit(limit).all()

def get_products_count(db: Session, category: Optional[str] = None):
    query = db.query(func.count(models.Product.id))
    if category:
        query = query.filter(models.Product.category == category)
    return query.scalar()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Record initial stock history
    create_stock_history(db, db_product.id, db_product.stock, "initial")
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product.model_dump(exclude_unset=True)
    
    # Track stock changes
    if "stock" in update_data and update_data["stock"] != db_product.stock:
        create_stock_history(db, product_id, update_data["stock"], "adjustment")
    
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db_product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
        return True
    return False

# Sale CRUD
def create_sale(db: Session, sale: schemas.SaleCreate):
    product = get_product(db, sale.product_id)
    if not product:
        raise ValueError("Product not found")
    
    if product.stock < sale.quantity:
        raise ValueError("Insufficient stock")
    
    # Calculate total
    total = product.price * sale.quantity
    
    # Create sale
    db_sale = models.Sale(
        product_id=sale.product_id,
        quantity=sale.quantity,
        total_amount=total
    )
    db.add(db_sale)
    
    # Update product stock
    product.stock -= sale.quantity
    product.updated_at = datetime.utcnow()
    
    # Record stock history
    create_stock_history(db, sale.product_id, product.stock, "sale")
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

def get_sales(db: Session, skip: int = 0, limit: int = 50):
    return db.query(models.Sale).order_by(desc(models.Sale.sale_date)).offset(skip).limit(limit).all()

# Stock History
def create_stock_history(db: Session, product_id: int, stock_level: int, action: str):
    history = models.StockHistory(
        product_id=product_id,
        stock_level=stock_level,
        action=action
    )
    db.add(history)
    db.commit()

def get_stock_history(db: Session, product_id: int, days: int = 30):
    cutoff = datetime.utcnow() - timedelta(days=days)
    return db.query(models.StockHistory).filter(
        models.StockHistory.product_id == product_id,
        models.StockHistory.recorded_at >= cutoff
    ).order_by(models.StockHistory.recorded_at).all()

# Analytics
def get_low_stock_products(db: Session):
    return db.query(models.Product).filter(
        models.Product.stock <= models.Product.reorder_level
    ).all()

def get_top_selling_products(db: Session, limit: int = 10, days: int = 30):
    cutoff = datetime.utcnow() - timedelta(days=days)
    return db.query(
        models.Product.id,
        models.Product.name,
        func.sum(models.Sale.quantity).label('total_sold')
    ).join(models.Sale).filter(
        models.Sale.sale_date >= cutoff
    ).group_by(models.Product.id).order_by(desc('total_sold')).limit(limit).all()
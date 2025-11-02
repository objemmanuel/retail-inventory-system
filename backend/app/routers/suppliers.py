from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime

from ..database import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"]
)

# Supplier CRUD
@router.post("/", response_model=schemas.Supplier, status_code=201)
def create_supplier(
    supplier: schemas.SupplierCreate,
    db: Session = Depends(get_db)
):
    """Create a new supplier"""
    db_supplier = models.Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.get("/", response_model=List[schemas.Supplier])
def get_suppliers(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all suppliers"""
    query = db.query(models.Supplier)
    if active_only:
        query = query.filter(models.Supplier.is_active == True)
    return query.offset(skip).limit(limit).all()

@router.get("/{supplier_id}", response_model=schemas.Supplier)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Get supplier by ID"""
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == supplier_id
    ).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.put("/{supplier_id}", response_model=schemas.Supplier)
def update_supplier(
    supplier_id: int,
    supplier: schemas.SupplierUpdate,
    db: Session = Depends(get_db)
):
    """Update supplier"""
    db_supplier = db.query(models.Supplier).filter(
        models.Supplier.id == supplier_id
    ).first()
    
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = supplier.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supplier, key, value)
    
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Delete supplier"""
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == supplier_id
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(supplier)
    db.commit()
    return {"message": "Supplier deleted successfully"}

# Purchase Orders
@router.post("/purchase-orders", response_model=schemas.PurchaseOrder, status_code=201)
def create_purchase_order(
    order: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db)
):
    """Create a purchase order"""
    # Verify supplier and product exist
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == order.supplier_id
    ).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    product = db.query(models.Product).filter(
        models.Product.id == order.product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate total cost
    total_cost = order.quantity * order.unit_cost
    
    # Create order
    db_order = models.PurchaseOrder(
        **order.model_dump(),
        total_cost=total_cost
    )
    
    db.add(db_order)
    
    # Update supplier stats
    supplier.total_orders += 1
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/purchase-orders", response_model=List[schemas.PurchaseOrder])
def get_purchase_orders(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    supplier_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all purchase orders"""
    query = db.query(models.PurchaseOrder)
    
    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    if supplier_id:
        query = query.filter(models.PurchaseOrder.supplier_id == supplier_id)
    
    return query.order_by(desc(models.PurchaseOrder.order_date)).offset(skip).limit(limit).all()

@router.put("/purchase-orders/{order_id}", response_model=schemas.PurchaseOrder)
def update_purchase_order(
    order_id: int,
    order_update: schemas.PurchaseOrderUpdate,
    db: Session = Depends(get_db)
):
    """Update purchase order status"""
    db_order = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.id == order_id
    ).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    update_data = order_update.model_dump(exclude_unset=True)
    
    # If status changed to delivered, update product stock
    if 'status' in update_data and update_data['status'] == 'delivered':
        if db_order.status != 'delivered':  # First time marking as delivered
            product = db.query(models.Product).filter(
                models.Product.id == db_order.product_id
            ).first()
            if product:
                product.stock += db_order.quantity
                
                # Create stock history
                stock_history = models.StockHistory(
                    product_id=product.id,
                    stock_level=product.stock,
                    action="restock"
                )
                db.add(stock_history)
        
        if 'actual_delivery' not in update_data:
            update_data['actual_delivery'] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/performance/{supplier_id}")
def get_supplier_performance(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    """Get supplier performance metrics"""
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == supplier_id
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Get all orders
    orders = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.supplier_id == supplier_id
    ).all()
    
    if not orders:
        return {
            "supplier_name": supplier.name,
            "total_orders": 0,
            "message": "No orders yet"
        }
    
    # Calculate metrics
    total_orders = len(orders)
    completed_orders = len([o for o in orders if o.status == 'delivered'])
    total_value = sum(o.total_cost for o in orders)
    
    # On-time delivery
    on_time = 0
    late = 0
    for order in orders:
        if order.status == 'delivered' and order.expected_delivery and order.actual_delivery:
            if order.actual_delivery <= order.expected_delivery:
                on_time += 1
            else:
                late += 1
    
    on_time_rate = (on_time / (on_time + late) * 100) if (on_time + late) > 0 else 100
    
    return {
        "supplier_id": supplier_id,
        "supplier_name": supplier.name,
        "rating": supplier.rating,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "total_value": total_value,
        "on_time_delivery_rate": round(on_time_rate, 2),
        "on_time_deliveries": on_time,
        "late_deliveries": late,
        "performance_score": round((on_time_rate / 100) * supplier.rating, 2)
    }
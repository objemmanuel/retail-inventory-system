"""
Create this as backend/app/routers/admin.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_admin, get_password_hash, log_activity

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)]
)

# User Management
@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    """Get all users (Admin only)"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/users", response_model=schemas.UserResponse, status_code=201)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    """Create new user (Admin only)"""
    # Check duplicates
    existing = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create user
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        role=user.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log_activity(db, current_user, "create", "user", db_user.id)
    
    return db_user

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    """Update user (Admin only)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    log_activity(db, current_user, "update", "user", user_id)
    
    return db_user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    """Delete user (Admin only)"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    
    # Log activity
    log_activity(db, current_user, "delete", "user", user_id)
    
    return {"message": "User deleted successfully"}

# Activity Logs
@router.get("/activity-logs", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs(
    skip: int = 0,
    limit: int = 100,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get activity logs (Admin only)"""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    logs = db.query(models.ActivityLog).filter(
        models.ActivityLog.timestamp >= cutoff
    ).order_by(desc(models.ActivityLog.timestamp)).offset(skip).limit(limit).all()
    
    return logs

# Dashboard Statistics
@router.get("/dashboard-stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    """Get comprehensive admin dashboard statistics"""
    
    # User stats
    total_users = db.query(func.count(models.User.id)).scalar()
    active_users = db.query(func.count(models.User.id)).filter(
        models.User.is_active == True
    ).scalar()
    
    # Product stats
    total_products = db.query(func.count(models.Product.id)).scalar()
    total_value = db.query(func.sum(models.Product.stock * models.Product.price)).scalar() or 0
    
    # Sales stats - last 30 days
    cutoff_30 = datetime.utcnow() - timedelta(days=30)
    revenue_30 = db.query(func.sum(models.Sale.total_amount)).filter(
        models.Sale.sale_date >= cutoff_30
    ).scalar() or 0
    
    sales_count_30 = db.query(func.count(models.Sale.id)).filter(
        models.Sale.sale_date >= cutoff_30
    ).scalar()
    
    # Sales stats - last 7 days
    cutoff_7 = datetime.utcnow() - timedelta(days=7)
    revenue_7 = db.query(func.sum(models.Sale.total_amount)).filter(
        models.Sale.sale_date >= cutoff_7
    ).scalar() or 0
    
    # Low stock products
    low_stock = db.query(func.count(models.Product.id)).filter(
        models.Product.stock <= models.Product.reorder_level
    ).scalar()
    
    # Recent activity count
    activity_24h = db.query(func.count(models.ActivityLog.id)).filter(
        models.ActivityLog.timestamp >= datetime.utcnow() - timedelta(hours=24)
    ).scalar()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users
        },
        "inventory": {
            "total_products": total_products,
            "total_value": float(total_value),
            "low_stock_count": low_stock
        },
        "sales": {
            "revenue_30_days": float(revenue_30),
            "revenue_7_days": float(revenue_7),
            "count_30_days": sales_count_30
        },
        "activity": {
            "logs_24h": activity_24h
        }
    }

# System Settings
@router.get("/system-info")
def get_system_info():
    """Get system information"""
    return {
        "version": "1.0.0",
        "environment": "production",
        "database": "postgresql",
        "ml_enabled": True
    }
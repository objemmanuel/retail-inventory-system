"""
Replace your entire backend/app/models.py with this file
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

# Product Model
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    stock = Column(Integer, nullable=False, default=0)
    price = Column(Float, nullable=False)
    reorder_level = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # New fields for barcode support
    barcode = Column(String, unique=True, nullable=True, index=True)
    sku = Column(String, unique=True, nullable=True, index=True)
    
    # Relationships
    sales = relationship("Sale", back_populates="product")
    stock_history = relationship("StockHistory", back_populates="product")

# Sale Model
class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)
    sale_date = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    product = relationship("Product", back_populates="sales")

# Stock History Model
class StockHistory(Base):
    __tablename__ = "stock_history"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    stock_level = Column(Integer, nullable=False)
    action = Column(String)  # 'sale', 'restock', 'adjustment', 'initial'
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    product = relationship("Product", back_populates="stock_history")

# Supplier Model
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    contact_person = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    rating = Column(Float, default=5.0)  # 0-5 stars
    total_orders = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

# Purchase Order Status Enum
class PurchaseOrderStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ORDERED = "ordered"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Purchase Order Model
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    status = Column(SQLEnum(PurchaseOrderStatus), default=PurchaseOrderStatus.PENDING)
    order_date = Column(DateTime, default=datetime.utcnow)
    expected_delivery = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchase_orders")
    product = relationship("Product")
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Product Schemas
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: str
    stock: int = Field(..., ge=0)
    price: float = Field(..., gt=0)
    reorder_level: int = Field(default=10, ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    price: Optional[float] = None
    reorder_level: Optional[int] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Sale Schemas
class SaleCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class Sale(BaseModel):
    id: int
    product_id: int
    quantity: int
    total_amount: float
    sale_date: datetime
    
    class Config:
        from_attributes = True

# Stock History Schema
class StockHistoryEntry(BaseModel):
    id: int
    product_id: int
    stock_level: int
    action: str
    recorded_at: datetime
    
    class Config:
        from_attributes = True

# Pagination Schema
class PaginatedProducts(BaseModel):
    total: int
    page: int
    per_page: int
    products: List[Product]

# ML Prediction Schema
class StockPrediction(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    predicted_days_until_stockout: Optional[float]
    reorder_recommended: bool
    predicted_stockout_date: Optional[datetime]

class PurchaseOrderStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ORDERED = "ordered"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    is_active: Optional[bool] = None

class Supplier(SupplierBase):
    id: int
    rating: float
    total_orders: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Purchase Order Schemas
class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_cost: float = Field(..., gt=0)
    expected_delivery: Optional[datetime] = None
    notes: Optional[str] = None

class PurchaseOrderUpdate(BaseModel):
    status: Optional[PurchaseOrderStatus] = None
    actual_delivery: Optional[datetime] = None
    notes: Optional[str] = None

class PurchaseOrder(BaseModel):
    id: int
    supplier_id: int
    product_id: int
    quantity: int
    unit_cost: float
    total_cost: float
    status: PurchaseOrderStatus
    order_date: datetime
    expected_delivery: Optional[datetime]
    actual_delivery: Optional[datetime]
    notes: Optional[str]
    
    class Config:
        from_attributes = True
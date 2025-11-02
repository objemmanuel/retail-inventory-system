from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

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
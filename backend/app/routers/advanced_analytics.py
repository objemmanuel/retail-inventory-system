"""
Create this as backend/app/routers/advanced_analytics.py
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..advanced_ml import advanced_analytics

router = APIRouter(
    prefix="/advanced-analytics",
    tags=["advanced-analytics"]
)

@router.get("/revenue-forecast")
def get_revenue_forecast(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    """Forecast future revenue using ML"""
    return advanced_analytics.revenue_forecasting(db, days)

@router.get("/seasonal-trends")
def get_seasonal_trends(db: Session = Depends(get_db)):
    """Analyze seasonal patterns in sales"""
    return advanced_analytics.seasonal_trends_analysis(db)

@router.get("/category-performance")
def get_category_performance(db: Session = Depends(get_db)):
    """Compare performance across categories"""
    return advanced_analytics.category_performance(db)

@router.get("/profit-margin/{product_id}")
def calculate_profit_margin(
    product_id: int,
    cost_price: float = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    """Calculate profit margins for a product"""
    return advanced_analytics.profit_margin_calculator(db, product_id, cost_price)

@router.get("/demand-forecast/{product_id}")
def forecast_demand(
    product_id: int,
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    """Predict future demand for a product"""
    return advanced_analytics.demand_forecasting(db, product_id, days)

@router.get("/price-optimization/{product_id}")
def optimize_price(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get optimal price suggestion"""
    return advanced_analytics.price_optimization(db, product_id)

@router.get("/anomaly-detection")
def detect_anomalies(db: Session = Depends(get_db)):
    """Detect unusual sales patterns"""
    return advanced_analytics.anomaly_detection(db)
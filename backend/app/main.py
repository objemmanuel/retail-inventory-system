from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from . import models
from .routers import products, analytics, sales, advanced_analytics, barcode, suppliers

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Retail API",
    description="Advanced inventory management with ML-powered insights, barcode scanning, and supplier management",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - configure for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL: ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(products.router)
app.include_router(analytics.router)
app.include_router(sales.router)
app.include_router(advanced_analytics.router)
app.include_router(barcode.router)
app.include_router(suppliers.router)

# Health check endpoints
@app.get("/")
def root():
    return {
        "message": "Smart Retail API v2.0",
        "status": "healthy",
        "version": "2.0.0",
        "features": [
            "Product Management",
            "Sales Tracking",
            "ML Predictions",
            "Revenue Forecasting",
            "Demand Forecasting",
            "Price Optimization",
            "Anomaly Detection",
            "Barcode Scanning",
            "Supplier Management",
            "Purchase Orders"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "database": "connected",
        "ml_models": "loaded"
    }

@app.get("/api-info")
def api_info():
    """Get API information and available endpoints"""
    return {
        "title": "Smart Retail API",
        "version": "2.0.0",
        "endpoints": {
            "products": "/products",
            "sales": "/sales",
            "analytics": "/analytics",
            "advanced_analytics": "/advanced-analytics",
            "barcode": "/barcode",
            "suppliers": "/suppliers",
            "documentation": "/docs",
            "alternative_docs": "/redoc"
        }
    }
from sklearn.linear_model import LinearRegression
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models

class StockPredictor:
    def __init__(self):
        self.model = LinearRegression()
    
    def predict_stockout_date(self, db: Session, product_id: int):
        """
        Predict when a product will run out of stock based on historical sales data.
        Returns days until stockout and predicted date.
        """
        # Get product
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product:
            return None
        
        # Get stock history for last 30 days
        cutoff = datetime.utcnow() - timedelta(days=30)
        history = db.query(models.StockHistory).filter(
            models.StockHistory.product_id == product_id,
            models.StockHistory.recorded_at >= cutoff
        ).order_by(models.StockHistory.recorded_at).all()
        
        if len(history) < 3:
            # Not enough data for prediction
            return {
                "product_id": product_id,
                "product_name": product.name,
                "current_stock": product.stock,
                "predicted_days_until_stockout": None,
                "reorder_recommended": product.stock <= product.reorder_level,
                "predicted_stockout_date": None,
                "confidence": "low",
                "message": "Insufficient historical data for prediction"
            }
        
        # Prepare data for linear regression
        # X = days since first record, y = stock level
        start_date = history[0].recorded_at
        X = np.array([[(h.recorded_at - start_date).days] for h in history])
        y = np.array([h.stock_level for h in history])
        
        # Train model
        self.model.fit(X, y)
        
        # Calculate current day
        current_day = (datetime.utcnow() - start_date).days
        
        # Predict future stock levels
        if self.model.coef_[0] >= 0:
            # Stock is not decreasing, no stockout predicted
            return {
                "product_id": product_id,
                "product_name": product.name,
                "current_stock": product.stock,
                "predicted_days_until_stockout": None,
                "reorder_recommended": product.stock <= product.reorder_level,
                "predicted_stockout_date": None,
                "confidence": "high",
                "message": "Stock levels are stable or increasing"
            }
        
        # Find when stock will reach 0
        # y = mx + b, solve for x when y = 0
        days_until_stockout = -self.model.intercept_ / self.model.coef_[0]
        days_remaining = days_until_stockout - current_day
        
        # Calculate R² score for confidence
        from sklearn.metrics import r2_score
        predictions = self.model.predict(X)
        confidence_score = r2_score(y, predictions)
        confidence = "high" if confidence_score > 0.7 else "medium" if confidence_score > 0.4 else "low"
        
        if days_remaining < 0:
            days_remaining = 0
        
        stockout_date = datetime.utcnow() + timedelta(days=days_remaining)
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "current_stock": product.stock,
            "predicted_days_until_stockout": round(days_remaining, 1),
            "reorder_recommended": days_remaining < 14 or product.stock <= product.reorder_level,
            "predicted_stockout_date": stockout_date,
            "confidence": confidence,
            "daily_depletion_rate": round(-self.model.coef_[0], 2)
        }
    
    def get_all_predictions(self, db: Session):
        """Get predictions for all products"""
        products = db.query(models.Product).all()
        predictions = []
        
        for product in products:
            pred = self.predict_stockout_date(db, product.id)
            if pred:
                predictions.append(pred)
        
        # Sort by days until stockout (urgent first)
        predictions.sort(key=lambda x: x.get("predicted_days_until_stockout") or float('inf'))
        return predictions

# Singleton instance
stock_predictor = StockPredictor()
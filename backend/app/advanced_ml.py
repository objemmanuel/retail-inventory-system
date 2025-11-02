import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Tuple
from . import models

class AdvancedAnalytics:
    """Advanced analytics and ML predictions"""
    
    def __init__(self):
        self.revenue_model = LinearRegression()
        self.demand_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.price_optimizer = Ridge(alpha=1.0)
        self.scaler = StandardScaler()
    
    def revenue_forecasting(self, db: Session, days_ahead: int = 30) -> Dict:
        """
        Predict future revenue using historical sales data
        """
        # Get historical sales data
        cutoff = datetime.utcnow() - timedelta(days=365)
        sales = db.query(
            func.date(models.Sale.sale_date).label('date'),
            func.sum(models.Sale.total_amount).label('revenue')
        ).filter(
            models.Sale.sale_date >= cutoff
        ).group_by(func.date(models.Sale.sale_date)).order_by('date').all()
        
        if len(sales) < 7:
            return {
                "error": "Insufficient data for forecasting",
                "message": "Need at least 7 days of sales data"
            }
        
        # Prepare data
        dates = [(s.date - sales[0].date).days for s in sales]
        revenues = [float(s.revenue) for s in sales]
        
        X = np.array(dates).reshape(-1, 1)
        y = np.array(revenues)
        
        # Train model
        self.revenue_model.fit(X, y)
        
        # Predict future
        last_date_offset = dates[-1]
        future_dates = np.array([last_date_offset + i for i in range(1, days_ahead + 1)]).reshape(-1, 1)
        predictions = self.revenue_model.predict(future_dates)
        
        # Calculate confidence
        r2_score = self.revenue_model.score(X, y)
        
        return {
            "forecast_days": days_ahead,
            "predicted_revenue": float(predictions.sum()),
            "daily_predictions": [
                {
                    "day": i + 1,
                    "date": (datetime.utcnow() + timedelta(days=i + 1)).strftime("%Y-%m-%d"),
                    "predicted_revenue": float(pred)
                }
                for i, pred in enumerate(predictions)
            ],
            "confidence": "high" if r2_score > 0.7 else "medium" if r2_score > 0.4 else "low",
            "accuracy_score": float(r2_score),
            "trend": "increasing" if predictions[-1] > predictions[0] else "decreasing"
        }
    
    def seasonal_trends_analysis(self, db: Session) -> Dict:
        """
        Analyze seasonal patterns in sales data
        """
        # Get sales data with month and day of week
        sales = db.query(
            extract('month', models.Sale.sale_date).label('month'),
            extract('dow', models.Sale.sale_date).label('day_of_week'),
            func.sum(models.Sale.total_amount).label('revenue'),
            func.count(models.Sale.id).label('count')
        ).filter(
            models.Sale.sale_date >= datetime.utcnow() - timedelta(days=365)
        ).group_by('month', 'day_of_week').all()
        
        if not sales:
            return {"error": "No sales data available"}
        
        # Analyze by month
        monthly_data = {}
        for sale in sales:
            month = int(sale.month)
            if month not in monthly_data:
                monthly_data[month] = {'revenue': 0, 'count': 0}
            monthly_data[month]['revenue'] += float(sale.revenue)
            monthly_data[month]['count'] += sale.count
        
        # Analyze by day of week (0=Sunday, 6=Saturday)
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        daily_data = {}
        for sale in sales:
            dow = int(sale.day_of_week)
            if dow not in daily_data:
                daily_data[dow] = {'revenue': 0, 'count': 0}
            daily_data[dow]['revenue'] += float(sale.revenue)
            daily_data[dow]['count'] += sale.count
        
        # Find peak periods
        peak_month = max(monthly_data.items(), key=lambda x: x[1]['revenue'])[0]
        peak_day = max(daily_data.items(), key=lambda x: x[1]['revenue'])[0]
        
        return {
            "monthly_trends": [
                {
                    "month": month,
                    "month_name": datetime(2024, month, 1).strftime("%B"),
                    "total_revenue": data['revenue'],
                    "total_sales": data['count'],
                    "avg_sale_value": data['revenue'] / data['count'] if data['count'] > 0 else 0
                }
                for month, data in sorted(monthly_data.items())
            ],
            "daily_trends": [
                {
                    "day_of_week": dow,
                    "day_name": day_names[dow],
                    "total_revenue": data['revenue'],
                    "total_sales": data['count'],
                    "avg_sale_value": data['revenue'] / data['count'] if data['count'] > 0 else 0
                }
                for dow, data in sorted(daily_data.items())
            ],
            "insights": {
                "peak_month": datetime(2024, peak_month, 1).strftime("%B"),
                "peak_day": day_names[peak_day],
                "best_selling_period": f"{day_names[peak_day]}s in {datetime(2024, peak_month, 1).strftime('%B')}"
            }
        }
    
    def category_performance(self, db: Session) -> List[Dict]:
        """
        Compare performance across product categories
        """
        cutoff = datetime.utcnow() - timedelta(days=30)
        
        # Get category performance
        performance = db.query(
            models.Product.category,
            func.count(models.Sale.id).label('sales_count'),
            func.sum(models.Sale.quantity).label('units_sold'),
            func.sum(models.Sale.total_amount).label('revenue'),
            func.avg(models.Product.price).label('avg_price')
        ).join(
            models.Sale, models.Product.id == models.Sale.product_id
        ).filter(
            models.Sale.sale_date >= cutoff
        ).group_by(models.Product.category).all()
        
        if not performance:
            return []
        
        total_revenue = sum(p.revenue for p in performance)
        
        results = []
        for p in performance:
            revenue = float(p.revenue)
            results.append({
                "category": p.category,
                "sales_count": p.sales_count,
                "units_sold": p.units_sold,
                "revenue": revenue,
                "avg_price": float(p.avg_price),
                "revenue_share": (revenue / total_revenue * 100) if total_revenue > 0 else 0,
                "avg_sale_value": revenue / p.sales_count if p.sales_count > 0 else 0
            })
        
        # Sort by revenue
        results.sort(key=lambda x: x['revenue'], reverse=True)
        
        return results
    
    def profit_margin_calculator(self, db: Session, product_id: int, cost_price: float) -> Dict:
        """
        Calculate profit margins for a product
        """
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        
        if not product:
            return {"error": "Product not found"}
        
        selling_price = product.price
        profit = selling_price - cost_price
        margin_percentage = (profit / selling_price * 100) if selling_price > 0 else 0
        markup_percentage = (profit / cost_price * 100) if cost_price > 0 else 0
        
        # Get sales data
        cutoff = datetime.utcnow() - timedelta(days=30)
        sales = db.query(
            func.sum(models.Sale.quantity).label('units_sold'),
            func.sum(models.Sale.total_amount).label('revenue')
        ).filter(
            models.Sale.product_id == product_id,
            models.Sale.sale_date >= cutoff
        ).first()
        
        units_sold = sales.units_sold if sales and sales.units_sold else 0
        revenue = float(sales.revenue) if sales and sales.revenue else 0
        total_profit = profit * units_sold
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "cost_price": cost_price,
            "selling_price": selling_price,
            "profit_per_unit": profit,
            "margin_percentage": margin_percentage,
            "markup_percentage": markup_percentage,
            "units_sold_30days": units_sold,
            "revenue_30days": revenue,
            "total_profit_30days": total_profit,
            "recommendation": self._get_margin_recommendation(margin_percentage)
        }
    
    def _get_margin_recommendation(self, margin: float) -> str:
        """Get recommendation based on profit margin"""
        if margin >= 50:
            return "Excellent margin - maintain pricing"
        elif margin >= 30:
            return "Good margin - healthy profit"
        elif margin >= 20:
            return "Average margin - consider optimization"
        elif margin >= 10:
            return "Low margin - review pricing strategy"
        else:
            return "Critical - margin too low, increase price or reduce costs"
    
    def demand_forecasting(self, db: Session, product_id: int, days_ahead: int = 30) -> Dict:
        """
        Predict future demand for a product using Random Forest
        """
        # Get historical sales
        sales = db.query(
            func.date(models.Sale.sale_date).label('date'),
            func.sum(models.Sale.quantity).label('quantity')
        ).filter(
            models.Sale.product_id == product_id,
            models.Sale.sale_date >= datetime.utcnow() - timedelta(days=90)
        ).group_by(func.date(models.Sale.sale_date)).order_by('date').all()
        
        if len(sales) < 7:
            return {
                "error": "Insufficient data",
                "message": "Need at least 7 days of sales data"
            }
        
        # Prepare features
        data = []
        for i, sale in enumerate(sales):
            data.append({
                'day_index': i,
                'day_of_week': sale.date.weekday(),
                'quantity': sale.quantity
            })
        
        df = pd.DataFrame(data)
        X = df[['day_index', 'day_of_week']].values
        y = df['quantity'].values
        
        # Train model
        self.demand_model.fit(X, y)
        
        # Predict future
        last_day_index = len(sales) - 1
        future_predictions = []
        
        for i in range(1, days_ahead + 1):
            future_date = sales[-1].date + timedelta(days=i)
            pred_X = np.array([[last_day_index + i, future_date.weekday()]])
            pred_quantity = self.demand_model.predict(pred_X)[0]
            
            future_predictions.append({
                "day": i,
                "date": future_date.strftime("%Y-%m-%d"),
                "predicted_quantity": max(0, int(pred_quantity))
            })
        
        total_predicted = sum(p['predicted_quantity'] for p in future_predictions)
        
        return {
            "product_id": product_id,
            "forecast_days": days_ahead,
            "total_predicted_demand": total_predicted,
            "daily_predictions": future_predictions,
            "recommended_stock_level": int(total_predicted * 1.2)  # 20% buffer
        }
    
    def price_optimization(self, db: Session, product_id: int) -> Dict:
        """
        Suggest optimal price based on sales patterns
        """
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        
        if not product:
            return {"error": "Product not found"}
        
        # Get historical sales
        sales = db.query(models.Sale).filter(
            models.Sale.product_id == product_id,
            models.Sale.sale_date >= datetime.utcnow() - timedelta(days=60)
        ).all()
        
        if len(sales) < 5:
            return {
                "error": "Insufficient data",
                "current_price": product.price,
                "message": "Need more sales data for optimization"
            }
        
        # Calculate metrics
        avg_quantity_per_sale = sum(s.quantity for s in sales) / len(sales)
        current_price = product.price
        
        # Simple optimization: price elasticity estimation
        # Higher sales = lower optimal price, lower sales = can increase price
        sales_velocity = len(sales) / 60  # sales per day
        
        if sales_velocity > 2:  # High demand
            suggested_price = current_price * 1.1  # Can increase 10%
            reason = "High demand - price increase recommended"
        elif sales_velocity > 1:  # Moderate demand
            suggested_price = current_price
            reason = "Optimal pricing - maintain current price"
        else:  # Low demand
            suggested_price = current_price * 0.9  # Decrease 10%
            reason = "Low demand - price reduction may boost sales"
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "current_price": current_price,
            "suggested_price": round(suggested_price, 2),
            "price_change_percentage": round(((suggested_price - current_price) / current_price * 100), 2),
            "reason": reason,
            "sales_velocity": round(sales_velocity, 2),
            "avg_quantity_per_sale": round(avg_quantity_per_sale, 2)
        }
    
    def anomaly_detection(self, db: Session) -> List[Dict]:
        """
        Detect unusual sales patterns
        """
        # Get recent sales
        cutoff = datetime.utcnow() - timedelta(days=30)
        sales = db.query(
            func.date(models.Sale.sale_date).label('date'),
            func.sum(models.Sale.total_amount).label('revenue'),
            func.count(models.Sale.id).label('count')
        ).filter(
            models.Sale.sale_date >= cutoff
        ).group_by(func.date(models.Sale.sale_date)).all()
        
        if len(sales) < 7:
            return []
        
        # Prepare data
        X = np.array([[s.revenue, s.count] for s in sales])
        
        # Detect anomalies
        self.anomaly_detector.fit(X)
        predictions = self.anomaly_detector.predict(X)
        
        # Find anomalies
        anomalies = []
        for i, (sale, pred) in enumerate(zip(sales, predictions)):
            if pred == -1:  # Anomaly detected
                avg_revenue = np.mean([s.revenue for s in sales])
                deviation = ((sale.revenue - avg_revenue) / avg_revenue * 100)
                
                anomalies.append({
                    "date": sale.date.strftime("%Y-%m-%d"),
                    "revenue": float(sale.revenue),
                    "sales_count": sale.count,
                    "deviation_percentage": round(deviation, 2),
                    "type": "unusually_high" if deviation > 0 else "unusually_low",
                    "severity": "high" if abs(deviation) > 50 else "medium"
                })
        
        return anomalies

# Singleton instance
advanced_analytics = AdvancedAnalytics()
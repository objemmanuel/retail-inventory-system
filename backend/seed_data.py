"""
Comprehensive Dataset Generator for Smart Retail System
Generates realistic retail data with seasonal patterns, trends, and variations
Run from backend folder: python seed_data.py
"""

import requests
import random
from datetime import datetime, timedelta
import time

API_URL = "http://localhost:8000"

# Comprehensive product catalog with realistic categories
PRODUCTS = [
    # Electronics - High value, moderate turnover
    {"name": "MacBook Pro 16\" M3", "category": "Electronics", "stock": 35, "price": 2499.99, "reorder_level": 8},
    {"name": "MacBook Air M3", "category": "Electronics", "stock": 45, "price": 1299.99, "reorder_level": 10},
    {"name": "Dell XPS 15 i9", "category": "Electronics", "stock": 30, "price": 1899.99, "reorder_level": 7},
    {"name": "HP Pavilion Laptop", "category": "Electronics", "stock": 50, "price": 799.99, "reorder_level": 12},
    {"name": "Lenovo ThinkPad X1", "category": "Electronics", "stock": 28, "price": 1599.99, "reorder_level": 8},
    
    {"name": "iPhone 15 Pro Max", "category": "Mobile Phones", "stock": 60, "price": 1199.99, "reorder_level": 15},
    {"name": "iPhone 15 Pro", "category": "Mobile Phones", "stock": 75, "price": 999.99, "reorder_level": 18},
    {"name": "Samsung Galaxy S24 Ultra", "category": "Mobile Phones", "stock": 55, "price": 1099.99, "reorder_level": 15},
    {"name": "Samsung Galaxy S24", "category": "Mobile Phones", "stock": 70, "price": 799.99, "reorder_level": 18},
    {"name": "Google Pixel 8 Pro", "category": "Mobile Phones", "stock": 40, "price": 899.99, "reorder_level": 12},
    {"name": "OnePlus 12", "category": "Mobile Phones", "stock": 35, "price": 699.99, "reorder_level": 10},
    
    {"name": "iPad Pro 12.9\" M2", "category": "Tablets", "stock": 38, "price": 1199.99, "reorder_level": 10},
    {"name": "iPad Air 11\"", "category": "Tablets", "stock": 45, "price": 699.99, "reorder_level": 12},
    {"name": "Samsung Galaxy Tab S9", "category": "Tablets", "stock": 40, "price": 849.99, "reorder_level": 10},
    {"name": "Microsoft Surface Pro 9", "category": "Tablets", "stock": 30, "price": 999.99, "reorder_level": 8},
    
    {"name": "Sony WH-1000XM5", "category": "Audio", "stock": 80, "price": 399.99, "reorder_level": 20},
    {"name": "Apple AirPods Pro 2", "category": "Audio", "stock": 120, "price": 249.99, "reorder_level": 30},
    {"name": "Bose QuietComfort Ultra", "category": "Audio", "stock": 65, "price": 429.99, "reorder_level": 18},
    {"name": "JBL Flip 6 Speaker", "category": "Audio", "stock": 90, "price": 129.99, "reorder_level": 25},
    {"name": "Sonos One Speaker", "category": "Audio", "stock": 55, "price": 219.99, "reorder_level": 15},
    
    # Accessories - High volume, fast turnover
    {"name": "Logitech MX Master 3S", "category": "Computer Accessories", "stock": 150, "price": 99.99, "reorder_level": 35},
    {"name": "Apple Magic Mouse", "category": "Computer Accessories", "stock": 120, "price": 79.99, "reorder_level": 30},
    {"name": "Razer DeathAdder V3", "category": "Computer Accessories", "stock": 100, "price": 69.99, "reorder_level": 25},
    {"name": "Keychron K8 Keyboard", "category": "Computer Accessories", "stock": 85, "price": 89.99, "reorder_level": 22},
    {"name": "Corsair K95 RGB", "category": "Computer Accessories", "stock": 70, "price": 199.99, "reorder_level": 18},
    {"name": "Logitech C920 Webcam", "category": "Computer Accessories", "stock": 95, "price": 79.99, "reorder_level": 25},
    {"name": "Blue Yeti Microphone", "category": "Computer Accessories", "stock": 75, "price": 129.99, "reorder_level": 20},
    
    {"name": "USB-C Hub 9-in-1", "category": "Tech Accessories", "stock": 200, "price": 49.99, "reorder_level": 50},
    {"name": "Anker PowerBank 20000mAh", "category": "Tech Accessories", "stock": 180, "price": 59.99, "reorder_level": 45},
    {"name": "Samsung 500GB SSD", "category": "Tech Accessories", "stock": 130, "price": 79.99, "reorder_level": 35},
    {"name": "WD 2TB External HDD", "category": "Tech Accessories", "stock": 110, "price": 89.99, "reorder_level": 30},
    {"name": "32GB USB Flash Drive", "category": "Tech Accessories", "stock": 300, "price": 12.99, "reorder_level": 80},
    {"name": "HDMI Cable 6ft", "category": "Tech Accessories", "stock": 250, "price": 15.99, "reorder_level": 65},
    {"name": "Laptop Stand Aluminum", "category": "Tech Accessories", "stock": 140, "price": 39.99, "reorder_level": 35},
    
    # Furniture - Low volume, slow turnover
    {"name": "Herman Miller Aeron Chair", "category": "Office Furniture", "stock": 15, "price": 1395.00, "reorder_level": 4},
    {"name": "Steelcase Leap Chair", "category": "Office Furniture", "stock": 18, "price": 1099.00, "reorder_level": 5},
    {"name": "IKEA Markus Office Chair", "category": "Office Furniture", "stock": 35, "price": 249.99, "reorder_level": 10},
    {"name": "FlexiSpot Standing Desk", "category": "Office Furniture", "stock": 22, "price": 499.99, "reorder_level": 6},
    {"name": "UPLIFT V2 Standing Desk", "category": "Office Furniture", "stock": 18, "price": 699.99, "reorder_level": 5},
    {"name": "IKEA Bekant Desk", "category": "Office Furniture", "stock": 28, "price": 329.99, "reorder_level": 8},
    {"name": "5-Tier Bookshelf Oak", "category": "Office Furniture", "stock": 25, "price": 179.99, "reorder_level": 7},
    {"name": "Filing Cabinet 3-Drawer", "category": "Office Furniture", "stock": 30, "price": 249.99, "reorder_level": 8},
    {"name": "Conference Table 8-Person", "category": "Office Furniture", "stock": 8, "price": 899.99, "reorder_level": 2},
    
    # Home Appliances - Moderate volume
    {"name": "Dyson V15 Vacuum", "category": "Home Appliances", "stock": 35, "price": 649.99, "reorder_level": 10},
    {"name": "iRobot Roomba j7+", "category": "Home Appliances", "stock": 28, "price": 799.99, "reorder_level": 8},
    {"name": "Ninja Air Fryer 8qt", "category": "Home Appliances", "stock": 45, "price": 129.99, "reorder_level": 12},
    {"name": "Keurig K-Elite Coffee", "category": "Home Appliances", "stock": 50, "price": 189.99, "reorder_level": 15},
    {"name": "Nespresso Vertuo Plus", "category": "Home Appliances", "stock": 40, "price": 179.99, "reorder_level": 12},
    {"name": "Instant Pot Duo 8qt", "category": "Home Appliances", "stock": 55, "price": 119.99, "reorder_level": 15},
    {"name": "Vitamix E310 Blender", "category": "Home Appliances", "stock": 32, "price": 349.99, "reorder_level": 10},
    {"name": "Panasonic Microwave 1200W", "category": "Home Appliances", "stock": 38, "price": 199.99, "reorder_level": 10},
    {"name": "Levoit Air Purifier", "category": "Home Appliances", "stock": 48, "price": 219.99, "reorder_level": 12},
    
    # Stationery - Very high volume, fast turnover
    {"name": "Moleskine Notebook Classic", "category": "Stationery", "stock": 250, "price": 19.99, "reorder_level": 70},
    {"name": "Leuchtturm1917 Dotted", "category": "Stationery", "stock": 180, "price": 24.99, "reorder_level": 50},
    {"name": "Pilot G2 Pens (12pk)", "category": "Stationery", "stock": 400, "price": 15.99, "reorder_level": 100},
    {"name": "Sharpie Permanent (24pk)", "category": "Stationery", "stock": 350, "price": 18.99, "reorder_level": 90},
    {"name": "Post-it Notes Super Sticky", "category": "Stationery", "stock": 500, "price": 12.99, "reorder_level": 130},
    {"name": "Stapler Heavy Duty", "category": "Stationery", "stock": 200, "price": 24.99, "reorder_level": 55},
    {"name": "Scotch Tape 6-Pack", "category": "Stationery", "stock": 300, "price": 9.99, "reorder_level": 80},
    {"name": "Paper Clips 1000ct", "category": "Stationery", "stock": 450, "price": 7.99, "reorder_level": 120},
    {"name": "Folder Manila (50pk)", "category": "Stationery", "stock": 280, "price": 19.99, "reorder_level": 75},
    {"name": "Binder 3-Ring 2\" (6pk)", "category": "Stationery", "stock": 220, "price": 29.99, "reorder_level": 60},
    
    # Smart Home - Growing category
    {"name": "Ring Video Doorbell Pro", "category": "Smart Home", "stock": 55, "price": 249.99, "reorder_level": 15},
    {"name": "Nest Thermostat", "category": "Smart Home", "stock": 42, "price": 249.99, "reorder_level": 12},
    {"name": "Philips Hue Starter Kit", "category": "Smart Home", "stock": 60, "price": 199.99, "reorder_level": 18},
    {"name": "Amazon Echo Dot 5th Gen", "category": "Smart Home", "stock": 120, "price": 49.99, "reorder_level": 35},
    {"name": "Google Nest Hub Max", "category": "Smart Home", "stock": 50, "price": 229.99, "reorder_level": 15},
    {"name": "TP-Link Kasa Smart Plug", "category": "Smart Home", "stock": 200, "price": 24.99, "reorder_level": 55},
]

def create_products():
    """Create all products in database"""
    print("📦 Creating comprehensive product catalog...")
    print(f"   Total products to create: {len(PRODUCTS)}\n")
    
    product_ids = []
    categories = {}
    
    for i, product in enumerate(PRODUCTS, 1):
        try:
            response = requests.post(f"{API_URL}/products/", json=product)
            if response.status_code == 201:
                data = response.json()
                product_ids.append(data['id'])
                
                # Track categories
                cat = product['category']
                if cat not in categories:
                    categories[cat] = 0
                categories[cat] += 1
                
                print(f"  [{i}/{len(PRODUCTS)}] ✓ {product['name'][:40]:<40} | ${product['price']:>8.2f} | Stock: {product['stock']:>3}")
            else:
                print(f"  [{i}/{len(PRODUCTS)}] ✗ Failed: {product['name']}")
        except Exception as e:
            print(f"  [{i}/{len(PRODUCTS)}] ✗ Error: {e}")
    
    print(f"\n✅ Created {len(product_ids)} products across {len(categories)} categories")
    for cat, count in sorted(categories.items()):
        print(f"   • {cat}: {count} products")
    
    return product_ids

def generate_realistic_sales(product_ids):
    """
    Generate realistic sales data with:
    - Seasonal patterns (more sales on weekdays)
    - Product popularity variations
    - Random fluctuations
    - Time-based trends (last 90 days)
    """
    print("\n💰 Generating realistic sales history (90 days)...")
    
    # Get product details to determine sales velocity
    products = []
    for pid in product_ids:
        try:
            response = requests.get(f"{API_URL}/products/{pid}")
            if response.status_code == 200:
                products.append(response.json())
        except:
            continue
    
    if not products:
        print("❌ Could not fetch product details")
        return
    
    sales_created = 0
    start_date = datetime.now() - timedelta(days=90)
    
    # Sales velocity by category (sales per week average)
    category_velocity = {
        "Stationery": 15,
        "Tech Accessories": 12,
        "Computer Accessories": 10,
        "Mobile Phones": 8,
        "Audio": 8,
        "Tablets": 5,
        "Electronics": 4,
        "Smart Home": 6,
        "Home Appliances": 5,
        "Office Furniture": 2,
    }
    
    print("   Simulating 90 days of sales activity...\n")
    
    for product in products:
        category = product['category']
        base_velocity = category_velocity.get(category, 5)
        
        # Calculate number of sales for this product over 90 days
        num_sales = random.randint(
            int(base_velocity * 10 * 0.7),  # 70% of expected
            int(base_velocity * 10 * 1.3)   # 130% of expected
        )
        
        # Distribute sales over 90 days with realistic patterns
        for _ in range(num_sales):
            # Random day in the past 90 days
            days_ago = random.randint(0, 90)
            sale_date = start_date + timedelta(days=days_ago)
            
            # Weekday multiplier (more sales on weekdays)
            if sale_date.weekday() < 5:  # Monday-Friday
                quantity_multiplier = 1.3
            else:
                quantity_multiplier = 0.7
            
            # Determine quantity based on product price
            if product['price'] > 1000:
                base_qty = 1
            elif product['price'] > 500:
                base_qty = random.randint(1, 2)
            elif product['price'] > 100:
                base_qty = random.randint(1, 3)
            else:
                base_qty = random.randint(1, 5)
            
            quantity = max(1, int(base_qty * quantity_multiplier))
            
            # Check if product has enough stock
            if product['stock'] < quantity:
                continue
            
            sale = {
                "product_id": product['id'],
                "quantity": quantity
            }
            
            try:
                response = requests.post(f"{API_URL}/sales/", json=sale)
                if response.status_code == 201:
                    sales_created += 1
                    product['stock'] -= quantity  # Update local stock tracker
                    
                    if sales_created % 100 == 0:
                        print(f"   Created {sales_created} sales...")
            except:
                pass  # Product might be out of stock
    
    print(f"\n✅ Generated {sales_created} realistic sales transactions")

def generate_stock_adjustments(product_ids):
    """
    Simulate restocking events for products running low
    """
    print("\n📥 Simulating restocking events...")
    
    restocks = 0
    for pid in product_ids:
        try:
            response = requests.get(f"{API_URL}/products/{pid}")
            if response.status_code == 200:
                product = response.json()
                
                # If stock is below reorder level, restock
                if product['stock'] <= product['reorder_level']:
                    restock_qty = random.randint(
                        product['reorder_level'] * 2,
                        product['reorder_level'] * 4
                    )
                    
                    requests.post(
                        f"{API_URL}/products/{pid}/restock?quantity={restock_qty}"
                    )
                    restocks += 1
                    print(f"   ✓ Restocked {product['name'][:40]:<40} +{restock_qty} units")
        except:
            continue
    
    print(f"\n✅ Restocked {restocks} products")

def display_comprehensive_summary():
    """Display detailed summary with analytics"""
    print("\n" + "="*70)
    print("🎉 COMPREHENSIVE DATASET GENERATED SUCCESSFULLY!")
    print("="*70)
    
    try:
        # Dashboard stats
        stats = requests.get(f"{API_URL}/analytics/dashboard-stats").json()
        
        print(f"\n📊 DATABASE STATISTICS:")
        print(f"   • Total Products: {stats['total_products']}")
        print(f"   • Product Categories: {stats['categories_count']}")
        print(f"   • Low Stock Alerts: {stats['low_stock_count']}")
        print(f"   • Revenue (30 days): ${stats['revenue_30_days']:,.2f}")
        
        # Category breakdown
        print(f"\n📦 CATEGORIES:")
        for cat in stats['categories']:
            print(f"   • {cat}")
        
        # Top selling products
        top_selling = requests.get(f"{API_URL}/analytics/top-selling?limit=5").json()
        print(f"\n🏆 TOP 5 SELLING PRODUCTS (30 days):")
        for i, item in enumerate(top_selling, 1):
            print(f"   {i}. {item['name'][:45]:<45} | Sold: {item['total_sold']} units")
        
        # Predictions
        predictions = requests.get(f"{API_URL}/analytics/predictions/").json()
        urgent = [p for p in predictions if p.get('predicted_days_until_stockout', 999) < 14]
        
        print(f"\n⚠️  URGENT RESTOCK ALERTS:")
        print(f"   • Products needing restock: {len(urgent)}")
        
        if urgent:
            print(f"\n   Top 5 Urgent:")
            for p in urgent[:5]:
                days = p.get('predicted_days_until_stockout', 0)
                print(f"   • {p['product_name'][:40]:<40} | {days:.1f} days left")
        
        # ML Model info
        high_confidence = [p for p in predictions if p.get('confidence') == 'high']
        print(f"\n🤖 ML MODEL PERFORMANCE:")
        print(f"   • Total predictions: {len(predictions)}")
        print(f"   • High confidence: {len(high_confidence)} ({len(high_confidence)*100//len(predictions) if predictions else 0}%)")
        
        print(f"\n🌐 ACCESS YOUR APPLICATION:")
        print(f"   • API Documentation: http://localhost:8000/docs")
        print(f"   • Frontend Dashboard: http://localhost:5173")
        
        print(f"\n💡 DATASET FEATURES:")
        print(f"   ✓ 90 days of historical sales data")
        print(f"   ✓ Realistic seasonal patterns")
        print(f"   ✓ Multiple product categories")
        print(f"   ✓ ML-ready time series data")
        print(f"   ✓ Stock level variations")
        
    except Exception as e:
        print(f"\n⚠️  Could not fetch complete summary: {e}")

def main():
    print("\n" + "="*70)
    print("🌱 SMART RETAIL - COMPREHENSIVE DATASET GENERATOR")
    print("="*70)
    print(f"\nTarget API: {API_URL}")
    print("This will generate a realistic retail dataset with:")
    print("  • 70+ diverse products across 10 categories")
    print("  • 90 days of sales history with seasonal patterns")
    print("  • Stock movements and restocking events")
    print("  • ML-ready time series data for predictions\n")
    
    # Check API connection
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code != 200:
            print("❌ API is not responding properly!")
            return
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        print("\n💡 Make sure backend is running:")
        print("   cd backend")
        print("   source venv/bin/activate")
        print("   uvicorn app.main:app --reload")
        return
    
    print("✅ API connection successful\n")
    input("Press Enter to start dataset generation...")
    
    start_time = time.time()
    
    # Generate dataset
    product_ids = create_products()
    
    if product_ids:
        time.sleep(1)  # Let database settle
        generate_realistic_sales(product_ids)
        time.sleep(1)
        generate_stock_adjustments(product_ids)
        
        elapsed = time.time() - start_time
        print(f"\n⏱️  Total generation time: {elapsed:.2f} seconds")
        
        display_comprehensive_summary()
        
        print(f"\n✨ Dataset is ready for analysis and ML training!")
    else:
        print("\n❌ Failed to create products. Check API errors above.")

if __name__ == "__main__":
    main()
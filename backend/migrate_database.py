"""
Database migration script to add new tables and columns
Run this: python migrate_database.py
"""

from app.database import engine, SessionLocal
from app import models
from sqlalchemy import inspect, text

def check_column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def check_table_exists(table_name):
    """Check if a table exists"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()

def migrate():
    """Run database migrations"""
    print("🔄 Starting database migration...")
    
    db = SessionLocal()
    
    try:
        # 1. Add barcode and sku columns to products table if they don't exist
        if check_table_exists('products'):
            print("\n📦 Checking products table...")
            
            if not check_column_exists('products', 'barcode'):
                print("  ➕ Adding barcode column...")
                db.execute(text("ALTER TABLE products ADD COLUMN barcode VARCHAR UNIQUE"))
                db.commit()
                print("  ✅ Barcode column added")
            else:
                print("  ✓ Barcode column already exists")
            
            if not check_column_exists('products', 'sku'):
                print("  ➕ Adding SKU column...")
                db.execute(text("ALTER TABLE products ADD COLUMN sku VARCHAR UNIQUE"))
                db.commit()
                print("  ✅ SKU column added")
            else:
                print("  ✓ SKU column already exists")
        
        # 2. Create new tables
        print("\n🆕 Creating new tables...")
        models.Base.metadata.create_all(bind=engine)
        print("  ✅ All tables created/updated")
        
        # 3. Verify tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("\n📊 Current database tables:")
        for table in tables:
            print(f"  ✓ {table}")
        
        print("\n✨ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
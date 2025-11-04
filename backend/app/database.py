from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment or default to local
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://smart_retail_user:AAxz0AXnqw7dhhpjqndZfbC0or1rEZDZ@dpg-d44rsouuk2gs73fm353g-a/smart_retail_6lxm"
)

# Fix for Railway/Render postgres URLs (they use postgres:// instead of postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
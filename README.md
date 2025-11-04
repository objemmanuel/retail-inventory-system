# 🛒 Smart Retail - AI-Powered Inventory Management System

<div align="center">

**A modern, full-stack inventory management system with AI-powered predictions, real-time analytics, and comprehensive supplier management.**

## 🌟 Live Demo

- **Frontend**: [https://retail-inventory-system-sage.vercel.app/](https://retail-inventory-system-sage.vercel.app/)
- **Backend API**: [https://retail-inventory-system-b8s9.onrender.com](https://retail-inventory-system-b8s9.onrender.com)
- **API Documentation**: [https://retail-inventory-system-b8s9.onrender.com/docs](https://retail-inventory-system-b8s9.onrender.com/docs)


### Dashboard 
![Dashboard Light Mode](screenshots/dashboard1.png) 
![Dashboard Dar Mode](screenshots/dashboard-dark.png) 

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Machine Learning Models](#-machine-learning-models)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Functionality
- ✅ **Product Management** - Full CRUD operations with search, filter, and pagination
- ✅ **Sales Tracking** - Record sales, track revenue across different time periods
- ✅ **Inventory Monitoring** - Real-time stock levels with low stock alerts
- ✅ **Supplier Management** - Track suppliers, purchase orders, and performance metrics

### 🤖 AI & Machine Learning
- 🧠 **Revenue Forecasting** - Predict future revenue using linear regression
- 📊 **Demand Forecasting** - AI-powered product demand predictions
- 💰 **Price Optimization** - Suggest optimal pricing based on sales velocity
- 🔍 **Anomaly Detection** - Identify unusual sales patterns automatically
- 📈 **Seasonal Trends Analysis** - Discover monthly and daily sales patterns

### 🔧 Advanced Features
- 📱 **Barcode Scanner** - Quick product lookup and sales via barcode/QR codes
- 📉 **Advanced Analytics** - Category performance, profit margins, ML insights
- 🌙 **Dark Mode** - Full dark theme support across all pages
- 📤 **Data Export** - Export inventory data as JSON or CSV
- ⚙️ **Customizable Settings** - User preferences, auto-refresh, display options

### 📊 Analytics & Reporting
- Real-time dashboard with key metrics
- Top selling products visualization
- Low stock alerts and reorder recommendations
- Stock history tracking
- Category performance comparison
- Revenue tracking (Today, Week, Month, All Time)

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18.2 + Vite
- **Styling**: Tailwind CSS (Dark mode support)
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useContext)

### **Backend**
- **Framework**: FastAPI 0.104
- **Database**: PostgreSQL + SQLAlchemy ORM
- **Authentication**: JWT (ready for implementation)
- **Data Validation**: Pydantic

### **Machine Learning**
- **Libraries**: scikit-learn, pandas, numpy
- **Models**: 
  - Linear Regression (Revenue & Demand Forecasting)
  - Random Forest (Demand Prediction)
  - Isolation Forest (Anomaly Detection)
  - Ridge Regression (Price Optimization)

### **Deployment**
- **Backend**: Railway
- **Frontend**: Vercel
- **Database**: Railway PostgreSQL

---

## 📸 Screenshots

### Products
![Products](screenshots/products.png)
![Products dark mode](screenshots/product_dark.png)
![Add Product](screenshots/add_product.png)
*Real-time overview with AI-powered predictions and analytics*

### Advanced Analytics
![Analytics Light mode](screenshots/analytics.png)
![Analytics dark mode](screenshots/analytic_dark.png)
![Advanced ML Analytics](screenshots/advanced_ml.png)
*ML-powered insights including revenue forecasting and seasonal trends*

### Barcode Scanner
![Scanner](screenshots/barcode.png)
*Quick product lookup and sales via barcode scanning*

### Suppliers
![Supplier Management](screenshots/supply.png)
![Add Supplier](screenshots/add_supplier.png)

### Sales
![Sales inventory](screenshots/sales.png)
![Record Sales](screenshots/record_sales.png)

### Settings
![Data Management Settings](screenshots/setting1.png)
![Appearance Settings](screenshots/setting2.png)

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### Local Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-retail.git
cd smart-retail
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
# Create PostgreSQL database named 'smart_retail'
# Or use Docker:
docker run --name postgres-retail \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=smart_retail \
  -p 5432:5432 \
  -d postgres:15

# Create .env file
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/smart_retail" > .env

# Run migrations
python migrate_database.py

# Seed database with sample data
python seed_data.py

# Start backend server
uvicorn app.main:app --reload
```

Backend will be running at: `http://localhost:8000`

#### 3. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend will be running at: `http://localhost:5173`

---

## 📁 Project Structure

```
smart-retail/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application
│   │   ├── database.py             # Database configuration
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── schemas.py              # Pydantic schemas
│   │   ├── crud.py                 # CRUD operations
│   │   ├── ml_model.py             # Basic ML predictions
│   │   ├── advanced_ml.py          # Advanced ML features
│   │   └── routers/
│   │       ├── products.py         # Product endpoints
│   │       ├── analytics.py        # Analytics endpoints
│   │       ├── sales.py            # Sales endpoints
│   │       ├── advanced_analytics.py
│   │       ├── barcode.py          # Barcode endpoints
│   │       └── suppliers.py        # Supplier endpoints
│   ├── requirements.txt
│   ├── seed_data.py               # Database seeding
│   ├── migrate_database.py        # Database migrations
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── contexts/
│   │   │   └── ThemeContext.jsx  # Dark mode context
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── AdvancedAnalytics.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   ├── BarcodeScanner.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env
│
└── README.md
```

---

## 📚 API Documentation

### Base URL
```
Local: http://localhost:8000
Production: https://your-backend.up.railway.app
```

### Interactive API Docs
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`

### Key Endpoints

#### Products
```http
GET    /products/              # List products (paginated)
POST   /products/              # Create product
GET    /products/{id}          # Get product by ID
PUT    /products/{id}          # Update product
DELETE /products/{id}          # Delete product
POST   /products/{id}/restock  # Restock product
```

#### Sales
```http
GET    /sales/                 # List sales
POST   /sales/                 # Create sale
```

#### Analytics
```http
GET    /analytics/low-stock                    # Low stock products
GET    /analytics/top-selling                  # Top selling products
GET    /analytics/stock-history/{product_id}   # Stock history
GET    /analytics/predictions/                 # All ML predictions
GET    /analytics/predictions/{product_id}     # Product prediction
```

#### Advanced Analytics
```http
GET    /advanced-analytics/revenue-forecast      # Revenue forecasting
GET    /advanced-analytics/seasonal-trends       # Seasonal patterns
GET    /advanced-analytics/category-performance  # Category analysis
GET    /advanced-analytics/demand-forecast/{id}  # Demand prediction
GET    /advanced-analytics/price-optimization/{id} # Price suggestions
GET    /advanced-analytics/anomaly-detection     # Detect anomalies
```

#### Barcode
```http
POST   /barcode/search          # Search by barcode
POST   /barcode/generate        # Generate barcode
POST   /barcode/quick-sale      # Quick sale via barcode
GET    /barcode/inventory-check/{barcode}  # Quick inventory check
```

#### Suppliers
```http
GET    /suppliers/                          # List suppliers
POST   /suppliers/                          # Create supplier
GET    /suppliers/{id}                      # Get supplier
PUT    /suppliers/{id}                      # Update supplier
DELETE /suppliers/{id}                      # Delete supplier
GET    /suppliers/purchase-orders           # List orders
POST   /suppliers/purchase-orders           # Create order
PUT    /suppliers/purchase-orders/{id}      # Update order
GET    /suppliers/performance/{id}          # Supplier metrics
```

---

## 🤖 Machine Learning Models

### 1. Revenue Forecasting
**Algorithm**: Linear Regression  
**Purpose**: Predict future revenue based on historical sales  
**Features**: Daily revenue trends over time  
**Output**: Forecasted revenue for next N days with confidence score

### 2. Demand Forecasting
**Algorithm**: Random Forest Regressor  
**Purpose**: Predict product demand  
**Features**: Day index, day of week, historical sales  
**Output**: Predicted quantity demand with recommended stock levels

### 3. Price Optimization
**Algorithm**: Ridge Regression  
**Purpose**: Suggest optimal pricing  
**Features**: Sales velocity, historical prices, demand patterns  
**Output**: Recommended price with percentage change

### 4. Anomaly Detection
**Algorithm**: Isolation Forest  
**Purpose**: Identify unusual sales patterns  
**Features**: Daily revenue, sales count  
**Output**: Flagged anomalies with severity levels

### 5. Seasonal Trends
**Algorithm**: Statistical Analysis  
**Purpose**: Discover patterns in sales data  
**Output**: Monthly and daily sales patterns with insights

---

## 🚀 Deployment

### Deploy to Railway (Backend)

```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add --plugin postgresql
railway up

# Get deployment URL
railway domain
```

### Deploy to Vercel (Frontend)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Environment Variables

**Backend (Railway)**:
```env
DATABASE_URL=<automatically_set_by_railway>
PORT=8000
```

**Frontend (Vercel)**:
```env
VITE_API_URL=https://your-backend.up.railway.app
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### API Testing
Use the interactive Swagger UI at `/docs` or import the Postman collection.

---

## 🎨 Customization

### Theme Customization
Edit `frontend/src/contexts/ThemeContext.jsx` to customize colors and preferences.

### Adding New Features
1. **Backend**: Add new router in `backend/app/routers/`
2. **Frontend**: Create new page in `frontend/src/pages/`
3. **API**: Update `api.js` service layer

---

## 🐛 Known Issues

- Barcode camera scanning requires additional library (jsQR) for full functionality
- Current implementation uses manual barcode entry as fallback
- Email notifications feature is planned for future release

---

## 🗺️ Roadmap

- [ ] Real-time barcode scanning with jsQR
- [ ] Email/SMS notifications for low stock
- [ ] Multi-location inventory support
- [ ] Mobile app (React Native)
- [ ] Customer management
- [ ] Advanced reporting (PDF exports)
- [ ] Role-based access control (Admin panel)
- [ ] Payment integration
- [ ] Offline mode support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript code
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Obiajulu Emmanuel**
- GitHub: [@objemmanuel](https://github.com/objemmanuel)
- LinkedIn: [Obiajulu Emmanuel](https://www.linkedin.com/in/obiajulu-emmanuel-609170234)

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - JavaScript library for building UIs
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Composable charting library
- [scikit-learn](https://scikit-learn.org/) - Machine learning library
- [Railway](https://railway.app/) - Deployment platform
- [Vercel](https://vercel.com/) - Frontend hosting

---

## 📞 Support

If you encounter any issues or have questions:
---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Obiajulu Emmanuel]

[⬆ Back to Top](#-smart-retail---ai-powered-inventory-management-system)

</div>
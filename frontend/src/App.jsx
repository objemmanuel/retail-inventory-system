import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Analytics from './pages/Analytics';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import Suppliers from './pages/Suppliers';
import BarcodeScanner from './pages/BarcodeScanner';
import Settings from './pages/Settings';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, Brain, Truck, Scan, Settings as SettingsIcon } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'sales', name: 'Sales', icon: ShoppingCart },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'advanced', name: 'Advanced ML', icon: Brain },
    { id: 'suppliers', name: 'Suppliers', icon: Truck },
    { id: 'scanner', name: 'Barcode Scanner', icon: Scan },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'sales':
        return <Sales />;
      case 'analytics':
        return <Analytics />;
      case 'advanced':
        return <AdvancedAnalytics />;
      case 'suppliers':
        return <Suppliers />;
      case 'scanner':
        return <BarcodeScanner />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Smart Retail</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inventory System</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
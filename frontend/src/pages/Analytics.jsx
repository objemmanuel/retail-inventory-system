import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Package, Brain, ChevronDown } from 'lucide-react';
import api from '../services/api';

export default function Analytics() {
  const [predictions, setPredictions] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    if (selectedProduct) {
      fetchStockHistory(selectedProduct.id);
    }
  }, [selectedProduct]);

  const fetchAnalytics = async () => {
    try {
      const [pred, top, low, stats] = await Promise.all([
        api.getAllPredictions(),
        api.getTopSelling(10, timeRange),
        api.getLowStock(),
        api.getDashboardStats()
      ]);

      setPredictions(pred);
      setTopSelling(top);
      setLowStock(low);

      // Aggregate by category
      const products = await api.getProducts(1, 100);
      const categoryMap = {};
      products.products.forEach(p => {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + p.stock;
      });
      setCategoryData(
        Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchStockHistory = async (productId) => {
    try {
      const history = await api.getStockHistory(productId, timeRange);
      const formatted = history.map(h => ({
        date: new Date(h.recorded_at).toLocaleDateString(),
        stock: h.stock_level,
        action: h.action
      }));
      setStockHistory(formatted);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    }
  };

  const urgentPredictions = predictions
    .filter(p => p.predicted_days_until_stockout !== null && p.predicted_days_until_stockout < 14)
    .sort((a, b) => a.predicted_days_until_stockout - b.predicted_days_until_stockout);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">AI-powered insights and predictions</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {[7, 14, 30, 60, 90].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg ${
                timeRange === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>

        {/* ML Predictions Section */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Brain size={28} />
              <h2 className="text-2xl font-bold">Machine Learning Predictions</h2>
            </div>
            <p className="text-purple-100">
              AI-powered stock forecasting using linear regression on historical sales data
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Urgent Alerts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-600" size={24} />
                <h3 className="text-lg font-semibold">Urgent Restocks ({urgentPredictions.length})</h3>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {urgentPredictions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No urgent restocks needed! 🎉
                  </p>
                ) : (
                  urgentPredictions.map(pred => (
                    <div
                      key={pred.product_id}
                      className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{pred.product_name}</p>
                          <p className="text-sm text-gray-600">
                            Current Stock: {pred.current_stock}
                          </p>
                          {pred.daily_depletion_rate && (
                            <p className="text-xs text-gray-500">
                              Depletion: -{pred.daily_depletion_rate} units/day
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">
                            {Math.round(pred.predicted_days_until_stockout)}
                          </p>
                          <p className="text-xs text-gray-600">days left</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            pred.confidence === 'high' ? 'bg-green-100 text-green-800' :
                            pred.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {pred.confidence}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <Package className="text-yellow-600" size={24} />
                <h3 className="text-lg font-semibold">Low Stock Items ({lowStock.length})</h3>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lowStock.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    All products are well stocked!
                  </p>
                ) : (
                  lowStock.map(product => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">{product.stock}</p>
                        <p className="text-xs text-gray-500">/ {product.reorder_level}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" />
              Top Selling Products ({timeRange} days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSelling}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_sold" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Stock by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock History Detail */}
        {selectedProduct && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedProduct.name} - Stock History</h3>
                <p className="text-sm text-gray-600">{selectedProduct.category}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="stock" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-bold text-gray-900">${selectedProduct.price}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Reorder Level</p>
                <p className="text-2xl font-bold text-gray-900">{selectedProduct.reorder_level}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
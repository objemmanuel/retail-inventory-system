import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertTriangle, ShoppingCart, Plus, X } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState({ products: [], total: 0 });
  const [predictions, setPredictions] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [stats, setStats] = useState({ total_products: 0, low_stock_count: 0, categories_count: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', category: '', stock: '', price: '', reorder_level: '10'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, predictionsRes, topSellingRes, lowStockRes, statsRes] = await Promise.all([
        api.getProducts(1, 10),
        api.getAllPredictions(),
        api.getTopSelling(5, 30),
        api.getLowStock(),
        api.getDashboardStats()
      ]);

      setProducts(productsRes);
      setPredictions(predictionsRes);
      setTopSelling(topSellingRes);
      setLowStock(lowStockRes);
      setStats(statsRes);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.stock || !formData.price) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await api.createProduct({
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        reorder_level: parseInt(formData.reorder_level)
      });
      setShowAddModal(false);
      setFormData({ name: '', category: '', stock: '', price: '', reorder_level: '10' });
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const urgentPredictions = predictions
    .filter(p => p.predicted_days_until_stockout !== null && p.predicted_days_until_stockout < 14)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">AI-powered inventory insights</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus size={20} />
              <span className="font-semibold">Add Product</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats.total_products}
            icon={<Package size={24} />}
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-blue-600"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.low_stock_count}
            icon={<AlertTriangle size={24} />}
            bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
            textColor="text-yellow-600"
          />
          <StatCard
            title="Urgent Restocks"
            value={urgentPredictions.length}
            icon={<TrendingUp size={24} />}
            bgColor="bg-gradient-to-br from-red-500 to-red-600"
            textColor="text-red-600"
          />
          <StatCard
            title="Categories"
            value={stats.categories_count}
            icon={<ShoppingCart size={24} />}
            bgColor="bg-gradient-to-br from-green-500 to-green-600"
            textColor="text-green-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h3>
            {topSelling.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSelling}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total_sold" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No sales data available</p>
              </div>
            )}
          </div>

          {/* Urgent Predictions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Urgent Stock Alerts</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {urgentPredictions.length > 0 ? (
                urgentPredictions.map(pred => (
                  <div
                    key={pred.product_id}
                    className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{pred.product_name}</p>
                        <p className="text-sm text-gray-600 mt-1">Stock: {pred.current_stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {Math.round(pred.predicted_days_until_stockout)}
                        </p>
                        <p className="text-xs text-gray-600">days left</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">🎉 All good!</p>
                  <p className="text-sm mt-2">No urgent restocks needed</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Recent Products</h3>
          </div>
          
          {products.products && products.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{product.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${product.stock <= product.reorder_level ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {product.stock <= product.reorder_level ? (
                          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <Package className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-600 text-lg font-semibold mb-2">No products yet</p>
              <p className="text-gray-500 mb-6">Start by adding your first product</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="e.g., iPhone 15 Pro"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="e.g., Electronics"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input 
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    type="number" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    type="number" 
                    step="0.01" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="999.99"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
                <input 
                  value={formData.reorder_level}
                  onChange={e => setFormData({...formData, reorder_level: e.target.value})}
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="10"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleAddProduct}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Add Product
                </button>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
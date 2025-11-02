import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertCircle, DollarSign, Calendar, Target, Zap, Clock } from 'lucide-react';
import api from '../services/api';

export default function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true);
  const [revenueForecasts, setRevenueForecasts] = useState(null);
  const [seasonalTrends, setSeasonalTrends] = useState(null);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [demandForecast, setDemandForecast] = useState(null);
  const [priceOptimization, setPriceOptimization] = useState(null);
  const [products, setProducts] = useState([]);
  const [forecastDays, setForecastDays] = useState(30);

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, [forecastDays]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revenue, seasonal, category, anomaly] = await Promise.all([
        fetch(`http://localhost:8000/advanced-analytics/revenue-forecast?days=${forecastDays}`).then(r => r.json()),
        fetch('http://localhost:8000/advanced-analytics/seasonal-trends').then(r => r.json()),
        fetch('http://localhost:8000/advanced-analytics/category-performance').then(r => r.json()),
        fetch('http://localhost:8000/advanced-analytics/anomaly-detection').then(r => r.json())
      ]);

      setRevenueForecasts(revenue);
      setSeasonalTrends(seasonal);
      setCategoryPerformance(category);
      setAnomalies(anomaly);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts(1, 100);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProductAnalytics = async (productId) => {
    try {
      const [demand, price] = await Promise.all([
        fetch(`http://localhost:8000/advanced-analytics/demand-forecast/${productId}?days=${forecastDays}`).then(r => r.json()),
        fetch(`http://localhost:8000/advanced-analytics/price-optimization/${productId}`).then(r => r.json())
      ]);

      setDemandForecast(demand);
      setPriceOptimization(price);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    setSelectedProduct(product);
    if (productId) {
      fetchProductAnalytics(productId);
    } else {
      setDemandForecast(null);
      setPriceOptimization(null);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <Brain className="text-purple-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced ML Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">AI-powered business insights and predictions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Forecast Days Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Forecast Period
          </label>
          <div className="flex gap-2">
            {[7, 14, 30, 60, 90].map(days => (
              <button
                key={days}
                onClick={() => setForecastDays(days)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  forecastDays === days
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Forecasting */}
        {revenueForecasts && !revenueForecasts.error && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="text-green-600" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Forecasting</h2>
                <p className="text-gray-600 dark:text-gray-400">ML-powered revenue predictions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-xl">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">Predicted Revenue</p>
                <p className="text-3xl font-bold text-green-900 dark:text-white mt-2">
                  ${revenueForecasts.predicted_revenue.toFixed(2)}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">Next {forecastDays} days</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Confidence Level</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-white mt-2 capitalize">
                  {revenueForecasts.confidence}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Score: {(revenueForecasts.accuracy_score * 100).toFixed(1)}%
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-xl">
                <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">Trend</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-white mt-2 capitalize flex items-center gap-2">
                  {revenueForecasts.trend}
                  <TrendingUp size={24} className={revenueForecasts.trend === 'increasing' ? 'text-green-600' : 'text-red-600'} />
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueForecasts.daily_predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" label={{ value: 'Days Ahead', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted_revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  name="Predicted Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Seasonal Trends */}
        {seasonalTrends && seasonalTrends.monthly_trends && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-orange-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Trends</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seasonalTrends.monthly_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month_name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-indigo-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Patterns</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seasonalTrends.daily_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day_name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Performance */}
        {categoryPerformance.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-pink-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Category Performance</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, revenue_share }) => `${category}: ${revenue_share.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {categoryPerformance.map((cat, index) => (
                  <div key={cat.category} className="border-l-4 p-4 rounded-lg" style={{ borderColor: COLORS[index % COLORS.length], backgroundColor: `${COLORS[index % COLORS.length]}15` }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{cat.category}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cat.units_sold} units sold • {cat.sales_count} sales
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">${cat.revenue.toFixed(0)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{cat.revenue_share.toFixed(1)}% share</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product-Specific Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-yellow-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Analytics</h2>
          </div>

          <select
            onChange={(e) => handleProductSelect(e.target.value)}
            className="w-full md:w-96 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {selectedProduct && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demand Forecast */}
              {demandForecast && !demandForecast.error && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-white mb-4">Demand Forecast</h3>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-blue-900 dark:text-white">
                      {demandForecast.total_predicted_demand} units
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Expected demand for next {forecastDays} days
                    </p>
                    <p className="text-sm font-semibold text-blue-900 dark:text-white mt-4">
                      Recommended Stock: {demandForecast.recommended_stock_level} units
                    </p>
                  </div>
                </div>
              )}

              {/* Price Optimization */}
              {priceOptimization && !priceOptimization.error && (
                <div className={`p-6 rounded-xl ${
                  priceOptimization.price_change_percentage > 0 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800'
                    : priceOptimization.price_change_percentage < 0
                    ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600'
                }`}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Price Optimization</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Current Price:</span>
                      <span className="font-bold text-gray-900 dark:text-white">${priceOptimization.current_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Suggested Price:</span>
                      <span className="font-bold text-gray-900 dark:text-white">${priceOptimization.suggested_price}</span>
                    </div>
                    <div className={`flex justify-between items-center p-2 rounded ${
                      priceOptimization.price_change_percentage > 0 ? 'bg-green-200 dark:bg-green-700' :
                      priceOptimization.price_change_percentage < 0 ? 'bg-orange-200 dark:bg-orange-700' :
                      'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      <span className="text-sm font-semibold">Change:</span>
                      <span className="font-bold">
                        {priceOptimization.price_change_percentage > 0 ? '+' : ''}
                        {priceOptimization.price_change_percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-3">
                      {priceOptimization.reason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Anomaly Detection */}
        {anomalies.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-red-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Anomaly Detection</h2>
            </div>

            <div className="space-y-3">
              {anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-lg ${
                    anomaly.type === 'unusually_high'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900'
                      : 'border-red-500 bg-red-50 dark:bg-red-900'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{anomaly.date}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {anomaly.type.replace('_', ' ')} sales pattern
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${anomaly.revenue.toFixed(2)}
                      </p>
                      <p className={`text-sm font-semibold ${
                        anomaly.deviation_percentage > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {anomaly.deviation_percentage > 0 ? '+' : ''}{anomaly.deviation_percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
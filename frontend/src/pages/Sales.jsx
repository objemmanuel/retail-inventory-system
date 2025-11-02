import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await api.getSales(0, 100);
      setSales(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts(1, 100);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateStats = (salesData) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todaySales = salesData.filter(s => new Date(s.sale_date) >= today);
    const weekSales = salesData.filter(s => new Date(s.sale_date) >= weekAgo);
    const monthSales = salesData.filter(s => new Date(s.sale_date) >= monthAgo);

    setStats({
      today: todaySales.reduce((sum, s) => sum + s.total_amount, 0),
      week: weekSales.reduce((sum, s) => sum + s.total_amount, 0),
      month: monthSales.reduce((sum, s) => sum + s.total_amount, 0),
      total: salesData.reduce((sum, s) => sum + s.total_amount, 0)
    });
  };

  const handleCreateSale = async () => {
    if (!selectedProduct || !quantity) {
      alert('Please select a product and quantity');
      return;
    }

    try {
      await api.createSale({
        product_id: parseInt(selectedProduct),
        quantity: parseInt(quantity)
      });
      setShowModal(false);
      setSelectedProduct('');
      setQuantity('1');
      fetchSales();
      alert('Sale recorded successfully!');
    } catch (error) {
      alert('Error creating sale: ' + error.message);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
            <p className="text-gray-600">Track and manage sales transactions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} />
            New Sale
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.today.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.week.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.month.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="text-purple-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-1">All Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.total.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <ShoppingCart className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Recent Sales</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Loading sales...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No sales recorded yet
                    </td>
                  </tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{sale.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <ShoppingCart className="text-gray-400 mr-2" size={16} />
                          <span className="font-medium text-gray-900">
                            {getProductName(sale.product_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                          {sale.quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                        ${sale.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(sale.sale_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Record New Sale</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price} (Stock: {product.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Enter quantity"
                />
              </div>

              {selectedProduct && quantity && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Amount:</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(
                      products.find(p => p.id === parseInt(selectedProduct))?.price * 
                      parseInt(quantity)
                    ).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateSale}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Record Sale
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedProduct('');
                    setQuantity('1');
                  }}
                  className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
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
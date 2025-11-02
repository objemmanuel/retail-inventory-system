import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, Star, Package, TrendingUp, Clock, X } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const [supplierForm, setSupplierForm] = useState({
    name: '', contact_person: '', email: '', phone: '', address: ''
  });

  const [orderForm, setOrderForm] = useState({
    supplier_id: '', product_id: '', quantity: '', unit_cost: '', expected_delivery: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, ordersRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/suppliers/`).then(r => r.json()),
        fetch(`${API_URL}/suppliers/purchase-orders`).then(r => r.json()),
        fetch(`${API_URL}/products/?page=1&per_page=100`).then(r => r.json())
      ]);

      setSuppliers(suppliersRes);
      setPurchaseOrders(ordersRes);
      setProducts(productsRes.products || []);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleAddSupplier = async () => {
    try {
      await fetch(`${API_URL}/suppliers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      setShowSupplierModal(false);
      setSupplierForm({ name: '', contact_person: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const totalCost = parseFloat(orderForm.unit_cost) * parseInt(orderForm.quantity);
      await fetch(`${API_URL}/suppliers/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          quantity: parseInt(orderForm.quantity),
          unit_cost: parseFloat(orderForm.unit_cost),
          supplier_id: parseInt(orderForm.supplier_id),
          product_id: parseInt(orderForm.product_id)
        })
      });
      setShowOrderModal(false);
      setOrderForm({ supplier_id: '', product_id: '', quantity: '', unit_cost: '', expected_delivery: '' });
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`${API_URL}/suppliers/purchase-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const viewPerformance = async (supplierId) => {
    try {
      const res = await fetch(`${API_URL}/suppliers/performance/${supplierId}`);
      const data = await res.json();
      setPerformance(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteSupplier = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await fetch(`${API_URL}/suppliers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      ordered: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Truck className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Track suppliers and purchase orders</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSupplierModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Supplier
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Package size={20} />
              New Order
            </button>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{supplier.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.contact_person}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => viewPerformance(supplier.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <TrendingUp size={18} />
                  </button>
                  <button
                    onClick={() => deleteSupplier(supplier.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="text-gray-900 dark:text-white">{supplier.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="text-gray-900 dark:text-white">{supplier.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < supplier.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {supplier.total_orders} orders
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Purchase Orders</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {purchaseOrders.map(order => {
                  const supplier = suppliers.find(s => s.id === order.supplier_id);
                  const product = products.find(p => p.id === order.product_id);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{supplier?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{product?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">${order.total_cost.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            defaultValue={order.status}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="ordered">Ordered</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Supplier</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                value={supplierForm.name}
                onChange={e => setSupplierForm({...supplierForm, name: e.target.value})}
                placeholder="Supplier Name *"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                value={supplierForm.contact_person}
                onChange={e => setSupplierForm({...supplierForm, contact_person: e.target.value})}
                placeholder="Contact Person"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                value={supplierForm.email}
                onChange={e => setSupplierForm({...supplierForm, email: e.target.value})}
                placeholder="Email"
                type="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                value={supplierForm.phone}
                onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})}
                placeholder="Phone"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                value={supplierForm.address}
                onChange={e => setSupplierForm({...supplierForm, address: e.target.value})}
                placeholder="Address"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddSupplier}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Add Supplier
                </button>
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create Purchase Order</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <select
                value={orderForm.supplier_id}
                onChange={e => setOrderForm({...orderForm, supplier_id: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={orderForm.product_id}
                onChange={e => setOrderForm({...orderForm, product_id: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <input
                value={orderForm.quantity}
                onChange={e => setOrderForm({...orderForm, quantity: e.target.value})}
                type="number"
                placeholder="Quantity"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <input
                value={orderForm.unit_cost}
                onChange={e => setOrderForm({...orderForm, unit_cost: e.target.value})}
                type="number"
                step="0.01"
                placeholder="Unit Cost"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <input
                value={orderForm.expected_delivery}
                onChange={e => setOrderForm({...orderForm, expected_delivery: e.target.value})}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              {orderForm.quantity && orderForm.unit_cost && (
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost:</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(parseFloat(orderForm.unit_cost) * parseInt(orderForm.quantity)).toFixed(2)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Create Order
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {performance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Performance</h3>
              <button onClick={() => setPerformance(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Supplier Name</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{performance.supplier_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-white">{performance.total_orders}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">Completed</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-white">{performance.completed_orders}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                  <p className="text-sm text-purple-800 dark:text-purple-200">Total Value</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-white">${performance.total_value.toFixed(2)}</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200">On-Time Rate</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-white">{performance.on_time_delivery_rate}%</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Performance Score</p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-white">{performance.performance_score}/5.0</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
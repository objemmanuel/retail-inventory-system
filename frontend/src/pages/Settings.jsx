import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Download, Upload, RefreshCw, Bell, Eye, Database, Trash2, Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = 'http://localhost:8000';

export default function Settings() {
  const { theme, toggleTheme, preferences, updatePreferences } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [stats, setStats] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/dashboard-stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSavePreferences = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const exportData = async (format) => {
    try {
      // In a real app, this would call an export endpoint
      const products = await fetch(`${API_URL}/products/?page=1&per_page=1000`).then(r => r.json());
      
      if (format === 'json') {
        const dataStr = JSON.stringify(products, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory-export-${Date.now()}.json`;
        link.click();
      } else if (format === 'csv') {
        // Convert to CSV
        const headers = ['ID', 'Name', 'Category', 'Stock', 'Price', 'Reorder Level'];
        const rows = products.products.map(p => 
          [p.id, p.name, p.category, p.stock, p.price, p.reorder_level].join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory-export-${Date.now()}.csv`;
        link.click();
      }
      
      alert(`Data exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      alert('Export failed: ' + error.message);
    }
  };

  const clearCache = () => {
    if (confirm('Clear all cached data? Recent scans and preferences will be reset.')) {
      localStorage.clear();
      alert('Cache cleared successfully! Please refresh the page.');
    }
  };

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: Eye },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data Management', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Customize your experience</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>

                  {/* Theme Toggle */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                          theme === 'light'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <Sun className={`mx-auto mb-3 ${theme === 'light' ? 'text-blue-600' : 'text-gray-400'}`} size={48} />
                        <p className="font-semibold text-gray-900 dark:text-white">Light Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bright and clear</p>
                      </button>

                      <button
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <Moon className={`mx-auto mb-3 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-400'}`} size={48} />
                        <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Easy on the eyes</p>
                      </button>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display Options</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reduce spacing and padding</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.compactMode}
                          onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Charts</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Display data visualizations</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.showCharts}
                          onChange={(e) => updatePreferences({ showCharts: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show ML Predictions</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Display AI-powered insights</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.showPredictions}
                          onChange={(e) => updatePreferences({ showPredictions: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Preferences</h2>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Auto Refresh</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Automatically update data</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.autoRefresh}
                        onChange={(e) => updatePreferences({ autoRefresh: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    {preferences.autoRefresh && (
                      <div className="ml-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <label className="block">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Refresh Interval (seconds)</span>
                          <input
                            type="number"
                            min="10"
                            max="300"
                            value={preferences.refreshInterval / 1000}
                            onChange={(e) => updatePreferences({ refreshInterval: parseInt(e.target.value) * 1000 })}
                            className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Save Preferences
                  </button>

                  {showSuccess && (
                    <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        ✓ Preferences saved successfully!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>

                  <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      🚧 Email and SMS notifications will be available in the next update. Stay tuned!
                    </p>
                  </div>

                  <div className="space-y-4 opacity-50 pointer-events-none">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Low Stock Alerts</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when stock is low</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Restock Reminders</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Automated restock notifications</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Daily Reports</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive daily sales summaries</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>
                  </div>
                </div>
              )}

              {/* Data Management Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Management</h2>

                  {/* Database Stats */}
                  {stats && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
                        <p className="text-sm text-blue-800 dark:text-blue-200">Total Products</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-white">{stats.total_products}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
                        <p className="text-sm text-green-800 dark:text-green-200">Categories</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-white">{stats.categories_count}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
                        <p className="text-sm text-purple-800 dark:text-purple-200">Low Stock</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-white">{stats.low_stock_count}</p>
                      </div>
                    </div>
                  )}

                  {/* Export Data */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Data</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => exportData('json')}
                        className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all group"
                      >
                        <Download className="mx-auto mb-2 text-gray-400 group-hover:text-blue-600" size={32} />
                        <p className="font-semibold text-gray-900 dark:text-white">Export as JSON</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Structured data format</p>
                      </button>

                      <button
                        onClick={() => exportData('csv')}
                        className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900 transition-all group"
                      >
                        <Download className="mx-auto mb-2 text-gray-400 group-hover:text-green-600" size={32} />
                        <p className="font-semibold text-gray-900 dark:text-white">Export as CSV</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Spreadsheet compatible</p>
                      </button>
                    </div>
                  </div>

                  {/* Import Data */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Data</h3>
                    
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-600 transition-colors cursor-pointer">
                      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="font-medium text-gray-900 dark:text-white mb-2">Drop files here or click to upload</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Supports JSON and CSV files</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Coming soon...</p>
                    </div>
                  </div>

                  {/* Clear Data */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clear Data</h3>
                    
                    <button
                      onClick={clearCache}
                      className="w-full p-4 bg-red-50 dark:bg-red-900 border-2 border-red-300 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="text-red-600" size={24} />
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-200">Clear Cache & Local Data</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Remove all locally stored preferences</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
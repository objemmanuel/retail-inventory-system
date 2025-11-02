import React, { useState, useEffect, useRef } from 'react';
import { Scan, Camera, Package, ShoppingCart, Search, CheckCircle, XCircle, Zap, Hash } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function BarcodeScanner() {
  const [manualBarcode, setManualBarcode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [usingCamera, setUsingCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Load recent scans from localStorage
    const saved = localStorage.getItem('recentScans');
    if (saved) {
      setRecentScans(JSON.parse(saved));
    }

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setUsingCamera(true);
      setError(null);
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions or use manual entry.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUsingCamera(false);
  };

  const captureBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // In a real app, use a barcode detection library like jsQR or quagga.js
    // For demo purposes, we'll use manual entry
    setError('Barcode detection requires additional library. Please use manual entry for now.');
    stopCamera();
  };

  const searchByBarcode = async (barcode) => {
    setError(null);
    setSearchResult(null);

    try {
      const response = await fetch(`${API_URL}/barcode/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode })
      });

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const data = await response.json();
      setSearchResult(data);
      
      // Add to recent scans
      const newScan = { ...data, scannedAt: new Date().toISOString() };
      const updated = [newScan, ...recentScans.slice(0, 9)];
      setRecentScans(updated);
      localStorage.setItem('recentScans', JSON.stringify(updated));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      searchByBarcode(manualBarcode.trim());
    }
  };

  const generateBarcode = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/barcode/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });

      const data = await response.json();
      alert(`Barcode generated: ${data.barcode}\nSKU: ${data.sku}`);
    } catch (err) {
      setError('Failed to generate barcode');
    }
  };

  const quickSale = async () => {
    if (!searchResult) return;

    try {
      const response = await fetch(`${API_URL}/barcode/quick-sale?barcode=${searchResult.barcode}&quantity=${saleQuantity}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }

      const data = await response.json();
      setShowSuccess(true);
      
      // Update search result with new stock
      setSearchResult({ ...searchResult, stock: data.remaining_stock });
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const checkInventory = async (barcode) => {
    try {
      const response = await fetch(`${API_URL}/barcode/inventory-check/${barcode}`);
      const data = await response.json();
      
      alert(
        `Product: ${data.product_name}\n` +
        `Stock: ${data.current_stock}\n` +
        `Reorder Level: ${data.reorder_level}\n` +
        `Status: ${data.status.toUpperCase()}\n` +
        `Price: $${data.price}`
      );
    } catch (err) {
      setError('Failed to check inventory');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Scan className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Barcode Scanner</h1>
              <p className="text-gray-600 dark:text-gray-400">Scan or search products by barcode</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-6">
            {/* Camera Scanner */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Camera size={24} className="text-purple-600" />
                  Camera Scanner
                </h2>
                {!usingCamera ? (
                  <button
                    onClick={startCamera}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center gap-2"
                  >
                    <Camera size={18} />
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Stop
                  </button>
                )}
              </div>

              {usingCamera ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      autoPlay
                      playsInline
                    />
                    <div className="absolute inset-0 border-4 border-purple-500 border-dashed animate-pulse pointer-events-none"></div>
                  </div>
                  <button
                    onClick={captureBarcode}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold flex items-center justify-center gap-2"
                  >
                    <Zap size={20} />
                    Capture Barcode
                  </button>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Camera size={64} className="mb-4 opacity-50" />
                  <p className="text-center px-4">
                    Camera not active.<br/>
                    Click "Start Camera" to begin scanning.
                  </p>
                  <p className="text-xs mt-4 text-center px-4 text-gray-400">
                    Note: Full barcode detection requires additional libraries.<br/>
                    Use manual entry for reliable results.
                  </p>
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Hash size={24} className="text-blue-600" />
                Manual Entry
              </h2>
              
              <form onSubmit={handleManualSearch} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Enter barcode number..."
                    className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold flex items-center justify-center gap-2"
                >
                  <Search size={20} />
                  Search Product
                </button>
              </form>

              {/* Quick Examples */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  💡 Try these sample barcodes:
                </p>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                  <button
                    onClick={() => setManualBarcode('1234567890123')}
                    className="block hover:underline"
                  >
                    • 1234567890123 (Sample 1)
                  </button>
                  <button
                    onClick={() => setManualBarcode('9876543210987')}
                    className="block hover:underline"
                  >
                    • 9876543210987 (Sample 2)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Search Result */}
            {searchResult && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Found</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {searchResult.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Category</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{searchResult.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Price</p>
                        <p className="font-semibold text-gray-900 dark:text-white">${searchResult.price}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Stock</p>
                        <p className={`font-semibold ${searchResult.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                          {searchResult.stock} units
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Barcode</p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white">{searchResult.barcode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Sale */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <ShoppingCart size={20} />
                      Quick Sale
                    </h3>
                    
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="1"
                        max={searchResult.stock}
                        value={saleQuantity}
                        onChange={(e) => setSaleQuantity(parseInt(e.target.value))}
                        className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={quickSale}
                        disabled={saleQuantity > searchResult.stock}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        Complete Sale - ${(searchResult.price * saleQuantity).toFixed(2)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="text-red-600 dark:text-red-400" size={20} />
                  <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded-lg animate-pulse">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Sale completed successfully!
                  </p>
                </div>
              </div>
            )}

            {/* Recent Scans */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package size={24} className="text-orange-600" />
                Recent Scans
              </h2>

              {recentScans.length > 0 ? (
                <div className="space-y-2">
                  {recentScans.map((scan, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => searchByBarcode(scan.barcode)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {scan.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {scan.barcode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${scan.price}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Stock: {scan.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent scans
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
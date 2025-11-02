// Check if API URL is set, fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API URL:', API_URL); // Debug log

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Requesting: ${url}`); // Debug log
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data); // Debug log
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      // Return empty data instead of throwing to prevent UI breaks
      if (endpoint.includes('/products')) {
        return { products: [], total: 0, page: 1, per_page: 10 };
      }
      return [];
    }
  }

  // Products
  async getProducts(page = 1, perPage = 10, category = null) {
    let endpoint = `/products/?page=${page}&per_page=${perPage}`;
    if (category) endpoint += `&category=${category}`;
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(product) {
    return this.request('/products/', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id, product) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async restockProduct(id, quantity) {
    return this.request(`/products/${id}/restock?quantity=${quantity}`, {
      method: 'POST',
    });
  }

  // Sales
  async createSale(sale) {
    return this.request('/sales/', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  async getSales(skip = 0, limit = 50) {
    return this.request(`/sales/?skip=${skip}&limit=${limit}`);
  }

  // Analytics
  async getLowStock() {
    return this.request('/analytics/low-stock');
  }

  async getTopSelling(limit = 10, days = 30) {
    return this.request(`/analytics/top-selling?limit=${limit}&days=${days}`);
  }

  async getStockHistory(productId, days = 30) {
    return this.request(`/analytics/stock-history/${productId}?days=${days}`);
  }

  async getDashboardStats() {
    try {
      return await this.request('/analytics/dashboard-stats');
    } catch (error) {
      return {
        total_products: 0,
        low_stock_count: 0,
        categories_count: 0,
        revenue_30_days: 0,
        categories: []
      };
    }
  }

  // ML Predictions
  async getPrediction(productId) {
    return this.request(`/analytics/predictions/${productId}`);
  }

  async getAllPredictions() {
    return this.request('/analytics/predictions/');
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${API_URL}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new ApiService();
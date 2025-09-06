/**
 * MyShop.tsx - User's Product Management Page
 * 
 * This component displays products that belong to the logged-in user.
 * Uses centralized API methods (http_get, http_post) for all server communication.
 * 
 * Features:
 * - Loads user's products using GET /products?my_products=true
 * - Real-time product deletion using POST /products-delete
 * - Search and filter functionality
 * - Responsive mobile-friendly design
 * - Error handling with retry mechanism
 * - Proper image URL formatting for backend storage
 * 
 * API Endpoints:
 * - GET /products?my_products=true&per_page=50 - Load user's products
 * - POST /products-delete { id: productId } - Delete product
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { http_get, http_post } from '../../services/Api';
import Utils from '../../services/Utils';
import { DB_LOGGED_IN_PROFILE } from '../../../Constants';
import './MyShop.css';

interface Product {
  id: number;
  name: string;
  price_1: string;
  price_2: string;
  feature_photo: string;
  category_text: string;
  status: string;
  in_stock: string;
  url: string; // Contact phone
  supplier: string; // Address
  description: string;
  date_added: string;
  created_at: string;
  updated_at: string;
  local_id: string;
  user: number;
  category: number;
  has_sizes: string;
  has_colors: string;
  p_type: string;
  currency: number;
  metric: number;
  rates: string; // JSON string of images
  sizes: string;
  colors: string;
  summary: any; // JSON data
}

interface LocationState {
  message?: string;
}

const MyShop: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Single useEffect without infinite loop
  useEffect(() => {
    // Check for success message from location state (only once)
    const state = location.state as LocationState;
    if (state?.message) {
      setMessage(state.message);
      setTimeout(() => setMessage(''), 5000);
    }
    
    // Load user's products on mount
    loadProducts();
  }, []); // Empty dependency array - only run once on mount

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is logged in
      const user = Utils.loadFromDatabase(DB_LOGGED_IN_PROFILE);
      if (!user || !user.id) {
        setError('Please log in to view your shop');
        navigate('/auth/login');
        return;
      }
      
      console.log('🛍️ Loading products for user:', user.id);
      
      // Use centralized http_get with my_products=true to get user's own products
      const response = await http_get('products', {
        my_products: 'true',
        per_page: 50 // Load more products per page
      });
      
      console.log('🛍️ Products API response:', response);
      
      if (response.code === 1) {
        // Handle paginated response - API returns paginated data
        const productsData = response.data?.data || response.data || [];
        console.log('✅ Loaded products:', productsData.length, 'products');
        
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          console.warn('⚠️ Products data is not an array:', productsData);
          setProducts([]);
        }
      } else {
        console.error('❌ Failed to load products:', response.message);
        setError(response.message || 'Failed to load products from server');
        setProducts([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading products:', error);
      setError(error.message || 'Network error - please check your connection');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('🗑️ Deleting product:', productId);
        
        // Use centralized http_post to delete product
        const response = await http_post('products-delete', {
          id: productId.toString()
        });
        
        console.log('🗑️ Delete response:', response);
        
        if (response.code === 1) {
          // Remove from local state
          setProducts(prev => prev.filter(p => p.id !== productId));
          setMessage('Product deleted successfully');
          console.log('✅ Product deleted successfully');
        } else {
          console.error('❌ Failed to delete product:', response.message);
          setError(response.message || 'Failed to delete product');
        }
      } catch (error: any) {
        console.error('❌ Error deleting product:', error);
        setError(error.message || 'Failed to delete product');
      }
    }
  };

  const handleEditProduct = (productId: number) => {
        navigate(`/account/my-shop/${productId}/edit`);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(parseInt(price));
  };

  const formatImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/media/svg/files/blank-image.svg';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Extract just the filename from the imageUrl path
    const filename = imageUrl.split('/').pop() || imageUrl;
    
    // Construct URL with proper storage path structure - same as HomePage
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8888/alsuk-backend';
    return `${baseUrl}/storage/images/${filename}`;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.status === '1') ||
                         (statusFilter === 'inactive' && product.status === '0');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="header-content">
          <h1 className="shop-title">My Products</h1>
          <div className="header-actions">
            <button 
              onClick={loadProducts} 
              className="refresh-btn"
              disabled={loading}
            >
              {loading ? '↻' : '↻'}
            </button>
            <button
              onClick={() => navigate('/account/my-shop/create')}
              className="add-product-btn"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Compact Search and Filters - Single Line */}
        <div className="shop-filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {message && (
        <div className="notification success">
          <i className="bi-check-circle"></i>
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="close-btn">
            <i className="bi-x"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="notification error">
          <i className="bi-exclamation-circle"></i>
          <span>{error}</span>
          <div className="error-actions">
            <button onClick={() => setError('')} className="close-btn">
              <i className="bi-x"></i>
            </button>
            <button onClick={loadProducts} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="shop-container">
        {loading ? (
          <div className="shop-loading">
            <div className="spinner-border"></div>
            <p>Loading your shop...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="shop-empty">
            {searchQuery || statusFilter !== 'all' ? (
              <>
                <i className="bi-search"></i>
                <p>No products found</p>
                <span>Try adjusting your search or filters</span>
                <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="clear-filters-btn">
                  Clear filters
                </button>
              </>
            ) : products.length === 0 ? (
              <>
                <i className="bi-shop"></i>
                <p>No products in your shop yet</p>
                <span>Start by adding your first product to AL-SUK</span>
                <button 
                  onClick={() => navigate('/account/my-shop/create')}
                  className="add-first-product-btn"
                >
                  Add Your First Product
                </button>
              </>
            ) : (
              <>
                <i className="bi-filter"></i>
                <p>No products match your filters</p>
                <span>Try different search terms or status filters</span>
                <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="clear-filters-btn">
                  Clear all filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="products-list">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-item">
                {/* Product Actions Overlay */}
                <div className="product-actions">
                  <button 
                    onClick={() => handleEditProduct(product.id)}
                    className="action-btn edit-btn"
                    title="Edit product"
                  >
                    <i className="bi-pencil"></i>
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="action-btn delete-btn"
                    title="Delete product"
                  >
                    <i className="bi-trash"></i>
                  </button>
                  
                  <button className="action-btn more-btn" title="More options">
                    <i className="bi-three-dots"></i>
                  </button>
                </div>

                {/* Product Image */}
                <div className="product-image">
                  <img 
                    src={formatImageUrl(product.feature_photo)} 
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/media/svg/files/blank-image.svg';
                    }}
                  />
                  <div className="product-status-overlay">
                    <span className={`status-badge ${product.status === '1' ? 'active' : 'inactive'}`}>
                      {product.status === '1' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                {/* Product Content */}
                <div className="product-content">
                  <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">{formatPrice(product.price_1)}</div>
                  </div>
                  
                  <div className="product-details">
                    <div className="product-category">
                      <i className="bi-tag"></i>
                      <span>{product.category_text}</span>
                    </div>
                    
                    <div className="product-location">
                      <i className="bi-geo-alt"></i>
                      <span>{product.supplier}</span>
                    </div>
                  </div>
                  
                  <div className="product-description">
                    {product.description}
                  </div>
                  
                  <div className="product-meta">
                    <span className={`stock-status ${product.in_stock === '1' ? 'in-stock' : 'out-of-stock'}`}>
                      <i className={`bi-${product.in_stock === '1' ? 'check-circle' : 'x-circle'}`}></i>
                      {product.in_stock === '1' ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="contact-phone">
                      <i className="bi-telephone"></i>
                      {product.url}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShop;
